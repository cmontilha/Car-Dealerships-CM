"""Views for the Dealerships CM project."""

from __future__ import annotations

import json
import logging
from decimal import Decimal, InvalidOperation
from typing import Dict, Iterable, List, Optional

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.db.models import Count, Max, Min, Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Car, CarMake, Comment, CommentLike, Favorite
from .populate import initiate
from .restapis import analyze_review_sentiments, get_request, post_review

logger = logging.getLogger(__name__)
User = get_user_model()


def _load_json(request) -> Optional[dict]:
    """Safely parse JSON from the request body."""

    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


def _user_payload(user: User) -> Dict[str, Optional[str]]:
    """Serialize a user to a dictionary for API responses."""

    return {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "full_name": user.get_full_name() or user.username,
    }


def _ensure_catalogue() -> None:
    """Create the default catalogue if the database is empty."""

    if not Car.objects.exists():
        initiate()


def _parse_decimal(value: Optional[str]) -> Optional[Decimal]:
    if value in (None, ""):
        return None
    try:
        return Decimal(value)
    except (InvalidOperation, TypeError):
        return None


def _parse_int(value: Optional[str]) -> Optional[int]:
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _serialize_car(
    car: Car,
    favorite_ids: Optional[Iterable[int]] = None,
    include_description: bool = False,
) -> Dict[str, object]:
    data = {
        "id": car.id,
        "name": car.name,
        "brand": car.make.name,
        "year": car.year,
        "type": car.car_type,
        "price": float(car.price),
        "image_url": car.image_url,
        "favorite_count": getattr(car, "favorite_count", None)
        if getattr(car, "favorite_count", None) is not None
        else car.favorites.count(),
        "comment_count": getattr(car, "comment_count", None)
        if getattr(car, "comment_count", None) is not None
        else car.comments.count(),
    }
    if include_description:
        data["description"] = car.description
    if favorite_ids is not None:
        data["is_favorite"] = car.id in favorite_ids
    return data


def _comment_node(
    comment: Comment,
    liked_ids: Iterable[int],
    current_user: Optional[User],
) -> Dict[str, object]:
    display_name = comment.user.get_full_name().strip() or comment.user.username
    return {
        "id": comment.id,
        "car_id": comment.car_id,
        "parent_id": comment.parent_id,
        "content": comment.content,
        "created_at": comment.created_at.isoformat(),
        "updated_at": comment.updated_at.isoformat(),
        "likes": getattr(comment, "like_count", 0),
        "liked": comment.id in liked_ids,
        "can_edit": bool(
            current_user
            and not current_user.is_anonymous
            and (current_user == comment.user or current_user.is_staff)
        ),
        "user": {
            "id": comment.user_id,
            "username": comment.user.username,
            "full_name": display_name,
        },
        "replies": [],
    }


def _comment_tree(car_id: int, user: Optional[User]) -> List[Dict[str, object]]:
    comments = list(
        Comment.objects.filter(car_id=car_id)
        .select_related("user", "parent")
        .annotate(like_count=Count("likes"))
        .order_by("created_at")
    )
    if user and not user.is_anonymous:
        liked_ids = set(
            CommentLike.objects.filter(user=user, comment__car_id=car_id)
            .values_list("comment_id", flat=True)
        )
    else:
        liked_ids = set()

    node_map = {comment.id: _comment_node(comment, liked_ids, user) for comment in comments}
    roots: List[Dict[str, object]] = []

    for comment in comments:
        node = node_map[comment.id]
        if comment.parent_id and comment.parent_id in node_map:
            node_map[comment.parent_id]["replies"].append(node)
        else:
            roots.append(node)
    return roots


@csrf_exempt
def api_register(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método não permitido."}, status=405)

    data = _load_json(request)
    if data is None:
        return JsonResponse({"error": "JSON inválido."}, status=400)

    username = (data.get("username") or data.get("userName") or "").strip()
    password = data.get("password")
    first_name = data.get("first_name") or data.get("firstName") or ""
    last_name = data.get("last_name") or data.get("lastName") or ""
    email = data.get("email") or ""

    if not username or not password:
        return JsonResponse({"error": "Usuário e senha são obrigatórios."}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Usuário já registrado."}, status=400)

    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        email=email,
    )
    login(request, user)
    return JsonResponse({"user": _user_payload(user)}, status=201)


@csrf_exempt
def api_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método não permitido."}, status=405)

    data = _load_json(request)
    if data is None:
        return JsonResponse({"error": "JSON inválido."}, status=400)

    username = (data.get("username") or data.get("userName") or "").strip()
    password = data.get("password")
    if not username or not password:
        return JsonResponse({"error": "Credenciais incompletas."}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"error": "Credenciais inválidas."}, status=401)

    login(request, user)
    return JsonResponse({"user": _user_payload(user)})


@csrf_exempt
def api_logout(request):
    if request.method not in ("POST", "DELETE"):
        return JsonResponse({"error": "Método não permitido."}, status=405)
    logout(request)
    return JsonResponse({"status": "ok"})


@csrf_exempt
def api_cars(request):
    if request.method != "GET":
        return JsonResponse({"error": "Método não permitido."}, status=405)

    _ensure_catalogue()

    cars = Car.objects.select_related("make").annotate(
        favorite_count=Count("favorites", distinct=True),
        comment_count=Count("comments", distinct=True),
    )

    search = request.GET.get("search")
    if search:
        cars = cars.filter(Q(name__icontains=search) | Q(make__name__icontains=search))

    brand = request.GET.get("brand")
    if brand:
        cars = cars.filter(make__name__iexact=brand.strip())

    price_min = _parse_decimal(request.GET.get("price_min"))
    price_max = _parse_decimal(request.GET.get("price_max"))
    if price_min is not None:
        cars = cars.filter(price__gte=price_min)
    if price_max is not None:
        cars = cars.filter(price__lte=price_max)

    year_min = _parse_int(request.GET.get("year_min"))
    year_max = _parse_int(request.GET.get("year_max"))
    if year_min is not None:
        cars = cars.filter(year__gte=year_min)
    if year_max is not None:
        cars = cars.filter(year__lte=year_max)

    favorite_ids: Optional[Iterable[int]] = None
    if request.user.is_authenticated:
        favorite_ids = set(
            Favorite.objects.filter(user=request.user).values_list("car_id", flat=True)
        )

    car_list = [_serialize_car(car, favorite_ids) for car in cars.order_by("make__name", "name")]

    price_range = Car.objects.aggregate(min_price=Min("price"), max_price=Max("price"))
    brands = list(CarMake.objects.filter(cars__isnull=False).order_by("name").values_list("name", flat=True).distinct())
    years = list(
        Car.objects.order_by("-year").values_list("year", flat=True).distinct()
    )

    return JsonResponse(
        {
            "cars": car_list,
            "filters": {
                "brands": brands,
                "years": years,
                "price": {
                    "min": float(price_range["min_price"]) if price_range["min_price"] is not None else None,
                    "max": float(price_range["max_price"]) if price_range["max_price"] is not None else None,
                },
            },
        }
    )


@csrf_exempt
def api_car_detail(request, car_id: int):
    if request.method != "GET":
        return JsonResponse({"error": "Método não permitido."}, status=405)

    _ensure_catalogue()

    try:
        car = (
            Car.objects.select_related("make")
            .annotate(
                favorite_count=Count("favorites", distinct=True),
                comment_count=Count("comments", distinct=True),
            )
            .get(pk=car_id)
        )
    except Car.DoesNotExist:
        return JsonResponse({"error": "Carro não encontrado."}, status=404)

    favorite_ids: Optional[Iterable[int]] = None
    if request.user.is_authenticated:
        favorite_ids = set(
            Favorite.objects.filter(user=request.user, car_id=car_id).values_list("car_id", flat=True)
        )

    data = _serialize_car(car, favorite_ids=favorite_ids, include_description=True)
    return JsonResponse({"car": data})


@csrf_exempt
def api_car_comments(request, car_id: int):
    _ensure_catalogue()

    if not Car.objects.filter(pk=car_id).exists():
        return JsonResponse({"error": "Carro não encontrado."}, status=404)

    if request.method == "GET":
        return JsonResponse({"comments": _comment_tree(car_id, request.user)})

    if request.method != "POST":
        return JsonResponse({"error": "Método não permitido."}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({"error": "Autenticação necessária."}, status=403)

    data = _load_json(request)
    if data is None:
        return JsonResponse({"error": "JSON inválido."}, status=400)

    content = (data.get("content") or "").strip()
    if not content:
        return JsonResponse({"error": "O comentário não pode estar vazio."}, status=400)

    parent_id = data.get("parent_id")
    parent = None
    if parent_id:
        try:
            parent = Comment.objects.get(pk=parent_id, car_id=car_id)
        except Comment.DoesNotExist:
            return JsonResponse({"error": "Comentário pai não encontrado."}, status=404)

    comment = Comment.objects.create(car_id=car_id, user=request.user, parent=parent, content=content)
    comment.like_count = 0
    node = _comment_node(comment, liked_ids=set(), current_user=request.user)
    return JsonResponse({"comment": node}, status=201)


@csrf_exempt
def api_car_comment_detail(request, car_id: int, comment_id: int):
    try:
        comment = Comment.objects.select_related("user", "car").annotate(like_count=Count("likes")).get(
            pk=comment_id, car_id=car_id
        )
    except Comment.DoesNotExist:
        return JsonResponse({"error": "Comentário não encontrado."}, status=404)

    if request.method == "DELETE":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Autenticação necessária."}, status=403)
        if request.user != comment.user and not request.user.is_staff:
            return JsonResponse({"error": "Sem permissão para remover."}, status=403)
        comment.delete()
        return JsonResponse({"status": "deleted"})

    if request.method in ("PUT", "PATCH"):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Autenticação necessária."}, status=403)
        if request.user != comment.user and not request.user.is_staff:
            return JsonResponse({"error": "Sem permissão para editar."}, status=403)

        data = _load_json(request)
        if data is None:
            return JsonResponse({"error": "JSON inválido."}, status=400)

        content = (data.get("content") or "").strip()
        if not content:
            return JsonResponse({"error": "O comentário não pode estar vazio."}, status=400)

        comment.content = content
        comment.save(update_fields=["content", "updated_at"])

        liked_ids = set()
        if request.user.is_authenticated and CommentLike.objects.filter(
            user=request.user, comment=comment
        ).exists():
            liked_ids.add(comment.id)
        node = _comment_node(comment, liked_ids=liked_ids, current_user=request.user)
        return JsonResponse({"comment": node})

    if request.method == "GET":
        liked_ids = set()
        if request.user.is_authenticated and CommentLike.objects.filter(
            user=request.user, comment=comment
        ).exists():
            liked_ids.add(comment.id)
        node = _comment_node(comment, liked_ids=liked_ids, current_user=request.user)
        return JsonResponse({"comment": node})

    return JsonResponse({"error": "Método não permitido."}, status=405)


@csrf_exempt
def api_toggle_favorite(request, car_id: int):
    if request.method != "POST":
        return JsonResponse({"error": "Método não permitido."}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({"error": "Autenticação necessária."}, status=403)

    try:
        car = Car.objects.get(pk=car_id)
    except Car.DoesNotExist:
        return JsonResponse({"error": "Carro não encontrado."}, status=404)

    favorite, created = Favorite.objects.get_or_create(user=request.user, car=car)
    if created:
        favorited = True
    else:
        favorite.delete()
        favorited = False

    count = Favorite.objects.filter(car=car).count()
    return JsonResponse({"favorited": favorited, "favorites": count})


@csrf_exempt
def api_toggle_comment_like(request, comment_id: int):
    if request.method != "POST":
        return JsonResponse({"error": "Método não permitido."}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({"error": "Autenticação necessária."}, status=403)

    try:
        comment = Comment.objects.get(pk=comment_id)
    except Comment.DoesNotExist:
        return JsonResponse({"error": "Comentário não encontrado."}, status=404)

    like, created = CommentLike.objects.get_or_create(user=request.user, comment=comment)
    if created:
        liked = True
    else:
        like.delete()
        liked = False

    count = CommentLike.objects.filter(comment=comment).count()
    return JsonResponse({"liked": liked, "likes": count})


@csrf_exempt
def api_user_profile(request):
    if request.method != "GET":
        return JsonResponse({"error": "Método não permitido."}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({"error": "Autenticação necessária."}, status=403)

    favorite_entries = (
        Favorite.objects.filter(user=request.user)
        .select_related("car__make")
        .annotate(comment_count=Count("car__comments", distinct=True))
        .order_by("-created_at")
    )
    favorite_ids = [entry.car_id for entry in favorite_entries]

    favorites = [
        {
            **_serialize_car(entry.car, favorite_ids=favorite_ids, include_description=False),
            "favorite_since": entry.created_at.isoformat(),
        }
        for entry in favorite_entries
    ]

    comments_qs = (
        Comment.objects.filter(user=request.user)
        .select_related("car__make")
        .annotate(like_count=Count("likes"))
        .order_by("-created_at")
    )
    comments = [
        {
            "id": comment.id,
            "car": {
                "id": comment.car_id,
                "name": comment.car.name,
                "brand": comment.car.make.name,
            },
            "content": comment.content,
            "created_at": comment.created_at.isoformat(),
            "updated_at": comment.updated_at.isoformat(),
            "likes": comment.like_count,
            "parent_id": comment.parent_id,
        }
        for comment in comments_qs
    ]

    return JsonResponse(
        {
            "user": _user_payload(request.user),
            "favorites": favorites,
            "comments": comments,
        }
    )


# Legacy endpoints retained for compatibility with the existing dealer views


@csrf_exempt
def get_dealerships(request, state="All"):
    if state == "All":
        endpoint = "/fetchDealers"
    else:
        endpoint = f"/fetchDealers/{state}"
    dealerships = get_request(endpoint)
    return JsonResponse({"status": 200, "dealers": dealerships})


@csrf_exempt
def get_dealer_reviews(request, dealer_id):
    if not dealer_id:
        return JsonResponse({"status": 400, "message": "Bad Request"})
    endpoint = f"/fetchReviews/dealer/{dealer_id}"
    reviews = get_request(endpoint)
    for review_detail in reviews:
        response = analyze_review_sentiments(review_detail["review"])
        review_detail["sentiment"] = response.get("sentiment") if response else "neutral"
    return JsonResponse({"status": 200, "reviews": reviews})


@csrf_exempt
def get_dealer_details(request, dealer_id):
    if not dealer_id:
        return JsonResponse({"status": 400, "message": "Bad Request"})
    endpoint = f"/fetchDealer/{dealer_id}"
    dealership = get_request(endpoint)
    return JsonResponse({"status": 200, "dealer": dealership})


@csrf_exempt
def add_review(request):
    if request.user.is_anonymous:
        return JsonResponse({"status": 403, "message": "Unauthorized"})
    data = _load_json(request)
    if data is None:
        return JsonResponse({"status": 400, "message": "Invalid payload"})
    try:
        post_review(data)
    except Exception as exc:  # pragma: no cover - network failure case
        logger.exception("Error posting review: %s", exc)
        return JsonResponse({"status": 401, "message": "Error in posting review"})
    return JsonResponse({"status": 200})


@csrf_exempt
def get_cars(request):
    """Legacy helper used by the historic front-end."""

    _ensure_catalogue()
    car_models = Car.objects.select_related("make")
    cars = [{"CarModel": car.name, "CarMake": car.make.name} for car in car_models]
    return JsonResponse({"CarModels": cars})


# Backwards compatible aliases for earlier coursework APIs
registration = api_register
login_user = api_login
logout_request = api_logout
