from django.contrib import admin

from .models import Car, CarMake, Comment, CommentLike, Favorite


class CarInline(admin.TabularInline):
    model = Car
    extra = 0


@admin.register(CarMake)
class CarMakeAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)
    inlines = [CarInline]


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ("name", "make", "year", "price")
    list_filter = ("make", "year", "car_type")
    search_fields = ("name", "make__name")


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "car", "created_at")
    search_fields = ("user__username", "car__name", "car__make__name")
    autocomplete_fields = ("user", "car")


class CommentLikeInline(admin.TabularInline):
    model = CommentLike
    extra = 0


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("user", "car", "created_at", "parent")
    list_filter = ("car", "user")
    search_fields = ("content", "user__username", "car__name")
    inlines = [CommentLikeInline]


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ("user", "comment", "created_at")
    search_fields = ("user__username", "comment__content")