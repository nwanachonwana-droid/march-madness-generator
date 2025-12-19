from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "March Madness Generator"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./march_madness.db"
    
    class Config:
        case_sensitive = True

settings = Settings()
