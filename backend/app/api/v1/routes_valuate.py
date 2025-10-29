from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ValuationInput(BaseModel):
    address: str | None = None
    property_type: str
    covered_m2: float
    uncovered_m2: float = 0
    condition: str = "standard"
    neighborhood: str | None = None

@router.post("/valuate")
def valuate(payload: ValuationInput):
    base_price_m2 = 2000
    factor = 1.0
    if payload.neighborhood:
        nb = payload.neighborhood.lower()
        if nb in ["palermo", "belgrano", "recoleta"]:
            factor = 1.25
        elif nb in ["caballito", "villa urquiza"]:
            factor = 1.10
        else:
            factor = 0.9
    total_m2 = payload.covered_m2 + 0.3 * payload.uncovered_m2
    estimate = base_price_m2 * factor * total_m2
    return {
        "estimate_usd": round(estimate, 2),
        "usd_per_m2": round(base_price_m2 * factor, 2),
        "confidence": 0.6,
        "comparables": []
    }
