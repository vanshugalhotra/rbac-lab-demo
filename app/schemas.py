from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "student"


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class AnnouncementCreate(BaseModel):
    title: str
    content: str


class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    created_by: str

    class Config:
        from_attributes = True


class UserSummary(BaseModel):
    username: str
    role: str

    class Config:
        from_attributes = True


class UserDetail(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True