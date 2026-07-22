from fastapi import FastAPI

from app.database import Base, engine
import app.models

from app.routes import router

from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(title="RBAC Demo")

app.include_router(router)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def home():
    return RedirectResponse("/static/login.html")