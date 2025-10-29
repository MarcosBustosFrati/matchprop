from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class Profile(BaseModel):
    budget_usd: float
    rooms: int | None = None
    neighborhood_pref: List[str] | None = None
    min_roi: float | None = None

@router.post("/match")
def match(profile: Profile):
    results = [
        {"id": "prop_001", "title": "2 amb con balcón en Caballito", "price_usd": 145000, "roi": 6.8, "affinity": 0.86},
        {"id": "prop_002", "title": "Monoambiente grande en Villa Urquiza", "price_usd": 96000, "roi": 6.2, "affinity": 0.78},
        {"id": "prop_003", "title": "3 amb en Palermo", "price_usd": 215000, "roi": 5.9, "affinity": 0.74},
    ]
    filtered = [r for r in results if r["price_usd"] <= profile.budget_usd]
    if profile.min_roi:
        filtered = [r for r in filtered if r["roi"] >= profile.min_roi]
    filtered.sort(key=lambda x: x["affinity"], reverse=True)
    return {"matches": filtered}
