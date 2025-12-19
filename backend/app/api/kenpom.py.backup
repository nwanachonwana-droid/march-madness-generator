from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.bracket import KenPomData
import csv
import io

router = APIRouter()

@router.post("/tournament/{tournament_id}/kenpom")
async def upload_kenpom_data(
    tournament_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload KenPom CSV data for a tournament"""
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    # Read CSV content
    content = await file.read()
    csv_text = content.decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(csv_text))
    
    uploaded_count = 0
    
    for row in csv_reader:
        # Expected CSV columns: Team, AdjEM, AdjO, AdjD, Tempo
        kenpom_entry = KenPomData(
            tournament_id=tournament_id,
            team_name=row.get('Team', '').strip(),
            adj_em=float(row.get('AdjEM', 0)),
            adj_o=float(row.get('AdjO', 0)),
            adj_d=float(row.get('AdjD', 0)),
            tempo=float(row.get('Tempo', 0))
        )
        db.add(kenpom_entry)
        uploaded_count += 1
    
    db.commit()
    
    return {
        "message": f"Successfully uploaded {uploaded_count} KenPom entries",
        "tournament_id": tournament_id,
        "count": uploaded_count
    }

@router.get("/tournament/{tournament_id}/kenpom")
async def get_kenpom_data(tournament_id: int, db: Session = Depends(get_db)):
    """Get all KenPom data for a tournament"""
    
    kenpom_data = db.query(KenPomData).filter(
        KenPomData.tournament_id == tournament_id
    ).all()
    
    return [{
        "id": entry.id,
        "team_name": entry.team_name,
        "adj_em": entry.adj_em,
        "adj_o": entry.adj_o,
        "adj_d": entry.adj_d,
        "tempo": entry.tempo
    } for entry in kenpom_data]
