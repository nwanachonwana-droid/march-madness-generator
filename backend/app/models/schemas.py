from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TeamInput(BaseModel):
    seed: int
    name: str
    region: str

class TournamentCreate(BaseModel):
    year: int
    teams: List[TeamInput]

class TournamentResponse(BaseModel):
    id: int
    year: int
    bracket_structure: dict
    created_at: datetime
    
    class Config:
        from_attributes = True
