from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.bracket_generator import generate_brackets
from app.models.bracket import GeneratedBracket

router = APIRouter()

@router.post("/tournament/{tournament_id}/generate")
async def generate_tournament_brackets(
    tournament_id: int,
    count: int = 200,
    db: Session = Depends(get_db)
):
    """Generate optimized brackets for a tournament"""
    
    try:
        brackets = generate_brackets(tournament_id, db, count)
        return {
            "message": f"Successfully generated {len(brackets)} brackets",
            "tournament_id": tournament_id,
            "brackets": brackets[:10]  # Return first 10 as preview
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.get("/tournament/{tournament_id}/brackets")
async def get_generated_brackets(
    tournament_id: int,
    db: Session = Depends(get_db)
):
    """Get all generated brackets for a tournament - WITH FULL PICKS"""
    
    brackets = db.query(GeneratedBracket).filter(
        GeneratedBracket.tournament_id == tournament_id
    ).all()
    
    return [{
        "id": b.id,
        "strategy": b.strategy,
        "champion": b.champion,
        "final_four": b.final_four,
        "expected_score": b.expected_score,
        "upset_count": b.upset_count,
        "pool_tag": b.pool_tag,
        "picks": b.picks,  # THIS WAS MISSING! Now includes all 63 picks
        "created_at": b.created_at
    } for b in brackets]

@router.delete("/tournament/{tournament_id}/brackets")
async def delete_generated_brackets(
    tournament_id: int,
    db: Session = Depends(get_db)
):
    """Delete all generated brackets for a tournament"""
    
    deleted = db.query(GeneratedBracket).filter(
        GeneratedBracket.tournament_id == tournament_id
    ).delete()
    
    db.commit()
    
    return {
        "message": f"Deleted {deleted} brackets",
        "tournament_id": tournament_id
    }
