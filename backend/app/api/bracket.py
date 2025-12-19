from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import TournamentCreate, TournamentResponse
from app.models.bracket import Tournament

router = APIRouter()

@router.post("/tournament", response_model=TournamentResponse)
async def create_tournament(
    tournament: TournamentCreate,
    db: Session = Depends(get_db)
):
    bracket_structure = {
        "year": tournament.year,
        "regions": {
            "East": [],
            "West": [],
            "South": [],
            "Midwest": []
        }
    }
    
    for team in tournament.teams:
        bracket_structure["regions"][team.region].append({
            "seed": team.seed,
            "name": team.name
        })
    
    for region in bracket_structure["regions"].values():
        region.sort(key=lambda x: x["seed"])
    
    db_tournament = Tournament(
        year=tournament.year,
        bracket_structure=bracket_structure
    )
    
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    
    return db_tournament

@router.get("/tournament/{tournament_id}", response_model=TournamentResponse)
async def get_tournament(
    tournament_id: int,
    db: Session = Depends(get_db)
):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament

@router.get("/tournaments")
async def list_tournaments(db: Session = Depends(get_db)):
    tournaments = db.query(Tournament).all()
    return tournaments
