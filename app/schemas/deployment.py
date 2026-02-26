from datetime import datetime
from pydantic import BaseModel


class DeploymentCreate(BaseModel):
    repo_url: str


class DeploymentResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    repo_url: str
    status: str
    container_id: str | None
    port: int | None
    logs: str | None
    created_at: datetime
    updated_at: datetime
