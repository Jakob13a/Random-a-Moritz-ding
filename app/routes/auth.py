from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix='/auth', tags=['auth'])

users: dict[str, dict[str, str]] = {}


class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post('/register')
def register(payload: RegisterRequest) -> dict[str, str]:
    if payload.email in users:
        raise HTTPException(status_code=400, detail='Benutzer existiert bereits')
    users[payload.email] = {'password': payload.password}
    return {'message': 'Registrierung erfolgreich'}


@router.post('/login')
def login(payload: LoginRequest) -> dict[str, str]:
    user = users.get(payload.email)
    if not user or user['password'] != payload.password:
        raise HTTPException(status_code=401, detail='Ungültige Anmeldedaten')
    return {'message': 'Login erfolgreich', 'token': 'demo-jwt-token'}
