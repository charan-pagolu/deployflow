import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.deployment import Deployment
from app.schemas.deployment import DeploymentCreate, DeploymentResponse
from app.services.deployment import run_deployment_pipeline

router = APIRouter()


@router.post("/deployments", response_model=DeploymentResponse, status_code=202)
def create_deployment(
    payload: DeploymentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    deployment = Deployment(id=str(uuid.uuid4()), repo_url=payload.repo_url)
    db.add(deployment)
    db.commit()
    db.refresh(deployment)

    background_tasks.add_task(
        run_deployment_pipeline, deployment.id, payload.repo_url
    )
    return deployment


@router.get("/deployments/{deployment_id}", response_model=DeploymentResponse)
def get_deployment(deployment_id: str, db: Session = Depends(get_db)):
    deployment = db.get(Deployment, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return deployment


@router.get("/deployments", response_model=list[DeploymentResponse])
def list_deployments(db: Session = Depends(get_db)):
    return db.query(Deployment).order_by(Deployment.created_at.desc()).all()
