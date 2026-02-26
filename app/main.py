from fastapi import FastAPI
from app.core.config import settings
from app.api.routes import health
from app.api.routes import deployments

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
)

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(deployments.router, prefix="/api/v1", tags=["deployments"])


@app.get("/")
def root():
    return {"message": f"Welcome to {settings.APP_NAME}", "version": settings.VERSION}
