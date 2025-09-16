"""Utility helpers to seed the database with initial car data."""

from decimal import Decimal

from .models import Car, CarMake


def initiate():
    """Populate the database with a curated catalogue of luxury cars."""

    cars_catalogue = [
        {
            "make": {"name": "Ferrari", "description": "Italian excellence and track-focused engineering."},
            "models": [
                {
                    "name": "SF90 Stradale",
                    "car_type": "HYPERCAR",
                    "year": 2023,
                    "price": Decimal("625000.00"),
                    "description": "Hybrid flagship blending V8 power with electric performance.",
                    "image_url": "https://images.unsplash.com/photo-1617813489996-3823bac2c2c8",
                },
                {
                    "name": "F8 Tributo",
                    "car_type": "SPORT",
                    "year": 2022,
                    "price": Decimal("280000.00"),
                    "description": "Twin-turbo V8 coupe celebrating Ferrari's mid-engine heritage.",
                    "image_url": "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
                },
            ],
        },
        {
            "make": {"name": "Porsche", "description": "Precision German engineering for road and track."},
            "models": [
                {
                    "name": "911 Turbo S",
                    "car_type": "SPORT",
                    "year": 2024,
                    "price": Decimal("207000.00"),
                    "description": "Iconic 911 platform delivering blistering acceleration and grip.",
                    "image_url": "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
                },
                {
                    "name": "Taycan Turbo S",
                    "car_type": "SEDAN",
                    "year": 2023,
                    "price": Decimal("196000.00"),
                    "description": "All-electric performance sedan with cutting-edge technology.",
                    "image_url": "https://images.unsplash.com/photo-1590362891991-f776e747a588",
                },
            ],
        },
        {
            "make": {"name": "Range Rover", "description": "Luxury SUVs capable of conquering any terrain."},
            "models": [
                {
                    "name": "Autobiography",
                    "car_type": "SUV",
                    "year": 2023,
                    "price": Decimal("155000.00"),
                    "description": "Flagship SUV balancing refinement with go-anywhere capability.",
                    "image_url": "https://images.unsplash.com/photo-1592194996308-7b43878e84a6",
                }
            ],
        },
        {
            "make": {"name": "Lamborghini", "description": "Bold Italian designs with unmistakable presence."},
            "models": [
                {
                    "name": "Aventador Ultimae",
                    "car_type": "HYPERCAR",
                    "year": 2022,
                    "price": Decimal("498000.00"),
                    "description": "Final V12 Aventador with dramatic styling and soundtrack.",
                    "image_url": "https://images.unsplash.com/photo-1549921296-3ecf9c8a3c95",
                }
            ],
        },
        {
            "make": {"name": "Chevrolet", "description": "American performance icons with everyday usability."},
            "models": [
                {
                    "name": "Corvette Z06",
                    "car_type": "SPORT",
                    "year": 2023,
                    "price": Decimal("110000.00"),
                    "description": "Track-honed Z06 featuring a high-revving flat-plane V8.",
                    "image_url": "https://images.unsplash.com/photo-1584345604476-8ec61a3e1af4",
                }
            ],
        },
        {
            "make": {"name": "Audi", "description": "Quattro all-wheel drive technology meets luxury craftsmanship."},
            "models": [
                {
                    "name": "R8 V10 Performance",
                    "car_type": "SPORT",
                    "year": 2023,
                    "price": Decimal("210000.00"),
                    "description": "Naturally aspirated V10 supercar with everyday comfort.",
                    "image_url": "https://images.unsplash.com/photo-1483721310020-03333e577078",
                }
            ],
        },
        {
            "make": {"name": "Mercedes-Benz AMG", "description": "Hand-built engines delivering uncompromising performance."},
            "models": [
                {
                    "name": "GT Black Series",
                    "car_type": "SPORT",
                    "year": 2021,
                    "price": Decimal("325000.00"),
                    "description": "Extreme aero and lightweight focus for the track-ready GT.",
                    "image_url": "https://images.unsplash.com/photo-1553440569-bcc63803a83d",
                }
            ],
        },
        {
            "make": {"name": "BMW", "description": "Driver-focused dynamics across the entire M portfolio."},
            "models": [
                {
                    "name": "M8 Competition",
                    "car_type": "GRAND_TOURER",
                    "year": 2024,
                    "price": Decimal("134000.00"),
                    "description": "Powerful grand tourer blending luxury with M engineering.",
                    "image_url": "https://images.unsplash.com/photo-1600718377522-43259f4b2c94",
                }
            ],
        },
        {
            "make": {"name": "Maserati", "description": "Italian flair with motorsport-inspired powertrains."},
            "models": [
                {
                    "name": "MC20",
                    "car_type": "SPORT",
                    "year": 2023,
                    "price": Decimal("212000.00"),
                    "description": "Carbon-fibre supercar ushering a new era for Maserati.",
                    "image_url": "https://images.unsplash.com/photo-1603386329225-868f9fa0c042",
                }
            ],
        },
        {
            "make": {"name": "Aston Martin", "description": "Handcrafted British grand tourers."},
            "models": [
                {
                    "name": "DBS Superleggera",
                    "car_type": "GRAND_TOURER",
                    "year": 2021,
                    "price": Decimal("316000.00"),
                    "description": "Twin-turbo V12 grand tourer with timeless style.",
                    "image_url": "https://images.unsplash.com/photo-1603387202120-4edb7c9fd68f",
                }
            ],
        },
        {
            "make": {"name": "Bentley", "description": "Ultra-luxury craftsmanship with immense power."},
            "models": [
                {
                    "name": "Continental GT Speed",
                    "car_type": "GRAND_TOURER",
                    "year": 2023,
                    "price": Decimal("274000.00"),
                    "description": "W12-powered grand tourer with incredible refinement.",
                    "image_url": "https://images.unsplash.com/photo-1603386443722-b70315ab57f0",
                }
            ],
        },
        {
            "make": {"name": "Rolls-Royce", "description": "Bespoke luxury and effortless performance."},
            "models": [
                {
                    "name": "Phantom",
                    "car_type": "GRAND_TOURER",
                    "year": 2023,
                    "price": Decimal("460000.00"),
                    "description": "The pinnacle of chauffeur-driven comfort and presence.",
                    "image_url": "https://images.unsplash.com/photo-1525609004556-61e16890a23b",
                }
            ],
        },
        {
            "make": {"name": "Jaguar", "description": "Graceful British sports cars with modern technology."},
            "models": [
                {
                    "name": "F-Type R",
                    "car_type": "SPORT",
                    "year": 2023,
                    "price": Decimal("118000.00"),
                    "description": "Supercharged V8 coupe with dramatic sound and style.",
                    "image_url": "https://images.unsplash.com/photo-1519648023493-d82b5f8d7fd8",
                }
            ],
        },
        {
            "make": {"name": "Bugatti", "description": "Record-breaking hypercars with unmatched engineering."},
            "models": [
                {
                    "name": "Chiron Super Sport",
                    "car_type": "HYPERCAR",
                    "year": 2022,
                    "price": Decimal("3900000.00"),
                    "description": "Quad-turbo W16 delivering extraordinary top speed.",
                    "image_url": "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
                }
            ],
        },
        {
            "make": {"name": "McLaren", "description": "Lightweight carbon innovation born from Formula 1."},
            "models": [
                {
                    "name": "765LT",
                    "car_type": "HYPERCAR",
                    "year": 2021,
                    "price": Decimal("358000.00"),
                    "description": "Longtail aerodynamics and extreme track focus.",
                    "image_url": "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
                }
            ],
        },
        {
            "make": {"name": "Lexus", "description": "Takumi craftsmanship blended with bold design."},
            "models": [
                {
                    "name": "LC 500",
                    "car_type": "GRAND_TOURER",
                    "year": 2023,
                    "price": Decimal("102000.00"),
                    "description": "Naturally aspirated V8 grand tourer with concept-car looks.",
                    "image_url": "https://images.unsplash.com/photo-1502877338535-766e1452684a",
                }
            ],
        },
        {
            "make": {"name": "Alfa Romeo", "description": "Italian performance sedans with motorsport heritage."},
            "models": [
                {
                    "name": "Giulia Quadrifoglio",
                    "car_type": "SEDAN",
                    "year": 2024,
                    "price": Decimal("81000.00"),
                    "description": "Ferrari-derived twin-turbo V6 with daily practicality.",
                    "image_url": "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642",
                }
            ],
        },
        {
            "make": {"name": "Cadillac", "description": "American luxury reimagined with V-Series performance."},
            "models": [
                {
                    "name": "Escalade V",
                    "car_type": "SUV",
                    "year": 2023,
                    "price": Decimal("149000.00"),
                    "description": "Supercharged V8 full-size SUV with commanding presence.",
                    "image_url": "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
                }
            ],
        },
        {
            "make": {"name": "Tesla", "description": "Industry-leading electric innovation."},
            "models": [
                {
                    "name": "Model S Plaid",
                    "car_type": "SEDAN",
                    "year": 2023,
                    "price": Decimal("135990.00"),
                    "description": "Tri-motor electric sedan with incredible acceleration.",
                    "image_url": "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
                }
            ],
        },
        {
            "make": {"name": "Nissan", "description": "High-tech Japanese performance icons."},
            "models": [
                {
                    "name": "GT-R Nismo",
                    "car_type": "SPORT",
                    "year": 2022,
                    "price": Decimal("215000.00"),
                    "description": "All-wheel-drive supercar tuned by NISMO engineers.",
                    "image_url": "https://images.unsplash.com/photo-1512495968721-52d4a3d1c951",
                }
            ],
        },
    ]

    for entry in cars_catalogue:
        make_info = entry["make"]
        make, _ = CarMake.objects.get_or_create(
            name=make_info["name"],
            defaults={"description": make_info.get("description", "")},
        )
        for model in entry["models"]:
            Car.objects.get_or_create(
                make=make,
                name=model["name"],
                year=model["year"],
                defaults={
                    "car_type": model["car_type"],
                    "price": model["price"],
                    "description": model.get("description", ""),
                    "image_url": model.get("image_url", ""),
                },
            )
