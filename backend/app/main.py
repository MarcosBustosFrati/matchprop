from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routes_valuate import router as valuate_router
from app.api.v1.routes_match import router as match_router

app = FastAPI(title="MatchProp API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

app.include_router(valuate_router, prefix="/api/v1")
app.include_router(match_router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "ok"}
