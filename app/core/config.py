from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "DeployFlow"
    VERSION: str = "0.1.0"
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/deployflow"

    class Config:
        env_file = ".env"


settings = Settings()
