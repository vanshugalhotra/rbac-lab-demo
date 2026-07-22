from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    require_roles,
    verify_password
)
from app.database import get_db
from app.models import User
from app.models import Announcement
from app.schemas import (
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
    AnnouncementCreate,
    AnnouncementResponse,
    UserDetail,
    UserSummary
)

router = APIRouter()


@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    existing_email = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    allowed_roles = ["admin", "staff", "student"]

    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Role must be one of {allowed_roles}"
        )

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):

    user = (
        db.query(User)
        .filter(User.username == credentials.username)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not verify_password(
        credentials.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_access_token(
        {
            "sub": user.username,
            "role": user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "username": current_user["sub"],
        "role": current_user["role"]
    }


@router.get("/admin")
def admin_panel(
    current_user=Depends(require_roles("admin"))
):
    return {
        "message": "Welcome Admin!",
        "user": current_user["sub"]
    }


@router.post(
    "/announcements",
    response_model=AnnouncementResponse
)
def create_announcement(
    announcement: AnnouncementCreate,
    current_user=Depends(require_roles("admin", "staff")),
    db: Session = Depends(get_db)
):

    new_announcement = Announcement(
        title=announcement.title,
        content=announcement.content,
        created_by=current_user["sub"]
    )

    db.add(new_announcement)
    db.commit()
    db.refresh(new_announcement)

    return new_announcement

@router.get(
    "/announcements",
    response_model=list[AnnouncementResponse]
)
def get_announcements(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return db.query(Announcement).all()


@router.get("/users")
def get_users(
    current_user=Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):

    users = db.query(User).all()

    if current_user["role"] == "admin":
        return [
            UserDetail.model_validate(user)
            for user in users
        ]

    return [
        UserSummary.model_validate(user)
        for user in users
    ]

@router.get("/permissions")
def get_permissions(
    current_user=Depends(get_current_user)
):

    permissions = {
        "student": [
            "View Profile",
            "View Announcements"
        ],

        "staff": [
            "View Profile",
            "View Users",
            "View Announcements",
            "Create Announcement"
        ],

        "admin": [
            "View Profile",
            "View Users",
            "View Announcements",
            "Create Announcement",
            "Admin Panel"
        ]
    }

    return {
        "role": current_user["role"],
        "permissions": permissions[current_user["role"]]
    }