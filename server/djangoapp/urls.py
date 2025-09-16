# Uncomment the imports before you add the code
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from . import views

app_name = 'djangoapp'
urlpatterns = [
    path(route='get_cars', view=views.get_cars, name='getcars'),
    path(route='registration', view=views.registration, name='registration'),
    path(route='register', view=views.registration, name='register'),
    path(route='login', view=views.login_user, name='login'),
    path(route='logout', view=views.logout_request, name='logout'),

    # API endpoints
    path('api/register/', views.api_register, name='api_register'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/logout/', views.api_logout, name='api_logout'),
    path('api/cars/', views.api_cars, name='api_cars'),
    path('api/cars/<int:car_id>/', views.api_car_detail, name='api_car_detail'),
    path('api/cars/<int:car_id>/comments/', views.api_car_comments, name='api_car_comments'),
    path(
        'api/cars/<int:car_id>/comments/<int:comment_id>/',
        views.api_car_comment_detail,
        name='api_car_comment_detail',
    ),
    path('api/cars/<int:car_id>/favorite/', views.api_toggle_favorite, name='api_toggle_favorite'),
    path('api/comments/<int:comment_id>/like/', views.api_toggle_comment_like, name='api_toggle_comment_like'),
    path('api/user/profile/', views.api_user_profile, name='api_user_profile'),

    # Dealer-related legacy APIs
    path(route='get_dealers', view=views.get_dealerships, name='get_dealers'),
    path(route='get_dealers/<str:state>', view=views.get_dealerships, name='get_dealers_by_state'),
    path(route='dealer/<int:dealer_id>', view=views.get_dealer_details, name='dealer_details'),
    path(route='reviews/dealer/<int:dealer_id>', view=views.get_dealer_reviews, name='dealer_details'),
    path(route='add_review', view=views.add_review, name='add_review'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
