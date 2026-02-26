import socket
import tempfile
import traceback

import docker

from app.db.session import SessionLocal
from app.models.deployment import Deployment


def _find_free_port() -> int:
    with socket.socket() as s:
        s.bind(("", 0))
        return s.getsockname()[1]


def run_deployment_pipeline(deployment_id: str, repo_url: str) -> None:
    db = SessionLocal()
    try:
        deployment = db.get(Deployment, deployment_id)

        # ── 1. Clone ──────────────────────────────────────────────────────────
        deployment.status = "building"
        db.commit()

        tmpdir = tempfile.mkdtemp()
        import subprocess
        result = subprocess.run(
            ["git", "clone", repo_url, tmpdir],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            raise RuntimeError(f"git clone failed:\n{result.stderr}")

        # ── 2. Build Docker image ─────────────────────────────────────────────
        client = docker.from_env()
        image_tag = f"deployflow-{deployment_id[:8]}"
        client.images.build(path=tmpdir, tag=image_tag, rm=True)

        # ── 3. Run container ──────────────────────────────────────────────────
        host_port = _find_free_port()
        container = client.containers.run(
            image_tag,
            detach=True,
            ports={"8000/tcp": host_port},
            name=f"deployflow-{deployment_id[:8]}",
        )

        # ── 4. Update DB ──────────────────────────────────────────────────────
        deployment.status = "running"
        deployment.container_id = container.id
        deployment.port = host_port
        deployment.logs = "Deployment successful"
        db.commit()

    except Exception:
        deployment = db.get(Deployment, deployment_id)
        deployment.status = "failed"
        deployment.logs = traceback.format_exc()
        db.commit()
    finally:
        db.close()
