from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix='/watchlist', tags=['watchlist'])

watchlist: dict[str, list[str]] = {}


class WatchlistPayload(BaseModel):
    email: str
    symbol: str


@router.get('/{email}')
def get_watchlist(email: str) -> list[str]:
    return watchlist.get(email, [])


@router.post('/add')
def add_to_watchlist(payload: WatchlistPayload) -> dict[str, str]:
    items = watchlist.setdefault(payload.email, [])
    if payload.symbol not in items:
        items.append(payload.symbol)
    return {'message': 'Hinzugefügt'}


@router.delete('/remove')
def remove_from_watchlist(payload: WatchlistPayload) -> dict[str, str]:
    items = watchlist.get(payload.email, [])
    if payload.symbol in items:
        items.remove(payload.symbol)
    return {'message': 'Entfernt'}
