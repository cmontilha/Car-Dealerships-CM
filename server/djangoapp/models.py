"""Database models for the dealership application."""

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class CarMake(models.Model):
    """Represents a car manufacturer/brand."""

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Car(models.Model):
    """Represents an individual car that can be displayed in the catalogue."""

    CAR_TYPES = [
        ("COUPE", "Coupe"),
        ("CONVERTIBLE", "Convertible"),
        ("SEDAN", "Sedan"),
        ("SUV", "SUV"),
        ("HYPERCAR", "Hypercar"),
        ("SPORT", "Sport"),
        ("GRAND_TOURER", "Grand Tourer"),
    ]

    make = models.ForeignKey(
        CarMake,
        on_delete=models.CASCADE,
        related_name="cars",
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    car_type = models.CharField(
        max_length=20,
        choices=CAR_TYPES,
        default="SPORT",
    )
    year = models.IntegerField(
        validators=[
            MinValueValidator(1990),
            MaxValueValidator(timezone.now().year + 1),
        ]
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["make__name", "name"]
        unique_together = ("make", "name", "year")

    def __str__(self) -> str:
        return f"{self.make.name} {self.name} ({self.year})"


class Favorite(models.Model):
    """Stores cars favourited by users."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorites",
    )
    car = models.ForeignKey(
        Car,
        on_delete=models.CASCADE,
        related_name="favorites",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "car")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user} → {self.car}"


class Comment(models.Model):
    """Comments left by users on individual cars."""

    car = models.ForeignKey(
        Car,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="car_comments",
    )
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        related_name="replies",
        on_delete=models.CASCADE,
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"Comment by {self.user} on {self.car}"


class CommentLike(models.Model):
    """Tracks likes on comments."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comment_likes",
    )
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name="likes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "comment")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user} likes comment {self.comment_id}"