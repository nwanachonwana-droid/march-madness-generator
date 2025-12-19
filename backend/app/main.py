from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import app.models.bracket
from app.core.database import engine, Base
from app.api import bracket as bracket_api
from app.api import kenpom as kenpom_api
from app.api import generate as generate_api
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="March Madness Bracket Generator",
    description="Generate optimized NCAA tournament brackets",
    version="1.0.0"
)

# CORS configuration for deployment
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://*.vercel.app",  # Allow all Vercel preview deployments
    os.getenv("FRONTEND_URL", ""),  # Production frontend URL from environment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bracket_api.router, prefix="/api/v1", tags=["brackets"])
app.include_router(kenpom_api.router, prefix="/api/v1", tags=["kenpom"])
app.include_router(generate_api.router, prefix="/api/v1", tags=["generation"])

@app.get("/")
async def root():
    return {
        "message": "March Madness Bracket Generator API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
