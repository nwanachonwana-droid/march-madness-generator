from sqlalchemy import Column, Integer, String, DateTime, JSON, Float
from sqlalchemy.sql import func
from app.core.database import Base

class Tournament(Base):
    __tablename__ = "tournaments"
    
    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    bracket_structure = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class KenPomData(Base):
    __tablename__ = "kenpom_data"
    
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, nullable=False)
    team_name = Column(String, nullable=False)
    adj_em = Column(Float, nullable=False)
    adj_o = Column(Float)
    adj_d = Column(Float)
    tempo = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class GeneratedBracket(Base):
    __tablename__ = "generated_brackets"
    
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, nullable=False)
    picks = Column(JSON, nullable=False)
    strategy = Column(String, nullable=False)
    champion = Column(String)
    final_four = Column(JSON)
    expected_score = Column(Float)
    upset_count = Column(Integer)
    pool_tag = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
