from datetime import date, timedelta
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter(prefix='/stocks', tags=['stocks'])

sample_stocks = [
    {
        'symbol': 'AAPL',
        'name': 'Apple Inc.',
        'price': 214.3,
        'change': 2.56,
        'volume': '85.2M',
        'marketCap': '3.4T',
        'peRatio': 34.2,
        'dividendYield': '0.52%',
        'category': 'stock',
        'tags': ['technology', 'consumer', 'largecap'],
        'history': [198.7, 201.2, 205.4, 210.8, 214.3],
    },
    {
        'symbol': 'NVDA',
        'name': 'NVIDIA Corp.',
        'price': 126.4,
        'change': -1.3,
        'volume': '64.1M',
        'marketCap': '3.1T',
        'peRatio': 48.6,
        'dividendYield': '0.04%',
        'category': 'stock',
        'tags': ['technology', 'semiconductor', 'ai'],
        'history': [121.6, 123.3, 124.8, 125.9, 126.4],
    },
    {
        'symbol': 'MSFT',
        'name': 'Microsoft Corp.',
        'price': 430.7,
        'change': 1.2,
        'volume': '32.8M',
        'marketCap': '3.2T',
        'peRatio': 37.5,
        'dividendYield': '0.72%',
        'category': 'stock',
        'tags': ['technology', 'software', 'cloud'],
        'history': [421.4, 424.7, 427.9, 429.8, 430.7],
    },
]

user_custom_stocks: dict[str, list[dict[str, Any]]] = {}

class CustomStockPayload(BaseModel):
    email: str
    symbol: str
    name: str
    history: list[float]
    description: str | None = None
    gameType: str | None = None
    fleetSize: int | None = None
    dailyPassengers: int | None = None
    airportFocus: str | None = None
    strategy: str | None = None


def get_user_custom_stocks(email: str | None = None) -> list[dict[str, Any]]:
    return user_custom_stocks.get(email or '', [])


def get_all_stocks(user: str | None = None) -> list[dict[str, Any]]:
    return [*sample_stocks, *get_user_custom_stocks(user)]


def find_stock(symbol: str, user: str | None = None) -> dict[str, Any] | None:
    normalized = symbol.upper()
    user_items = get_user_custom_stocks(user)
    found_user_item = next((item for item in user_items if item['symbol'].upper() == normalized), None)
    if found_user_item:
        return found_user_item
    return next((item for item in get_all_stocks(user) if item['symbol'].upper() == normalized), None)


@router.get('')
def list_stocks(
    query: str | None = Query(None, title='Search query', description='Filter stock symbols, names, categories, tags or descriptions'),
    user: str | None = Query(None, title='User email', description='Optional user email to show user-specific assets'),
) -> list[dict[str, Any]]:
    items = get_all_stocks(user)
    if query is not None and query.strip() != '':
        needle = query.strip().lower()
        items = [
            item for item in items
            if needle in item['symbol'].lower()
            or needle in item['name'].lower()
            or needle in item.get('category', '').lower()
            or needle in item.get('description', '').lower()
            or any(needle in str(tag).lower() for tag in item.get('tags', []))
        ]
    return items


@router.post('/custom')
def create_custom_stock(payload: CustomStockPayload) -> dict[str, Any]:
    if not payload.email:
        raise HTTPException(status_code=400, detail='Benutzer-E-Mail ist erforderlich.')
    if len(payload.history) < 3:
        raise HTTPException(status_code=400, detail='Mindestens 3 historische Werte sind nötig.')
    if find_stock(payload.symbol, payload.email):
        raise HTTPException(status_code=400, detail='Dieses Symbol existiert bereits für diesen Benutzer.')

    stock = {
        'symbol': payload.symbol.upper(),
        'name': payload.name,
        'price': round(float(payload.history[-1]), 2),
        'change': round(float(payload.history[-1] - payload.history[-2]), 2),
        'volume': 'N/A',
        'marketCap': 'N/A',
        'peRatio': 'N/A',
        'dividendYield': 'N/A',
        'category': 'game',
        'tags': ['airlinemanager', 'game', 'airline'],
        'history': [round(float(value), 2) for value in payload.history],
        'description': payload.description or 'Spiel-Asset mit eigener Historie.',
        'gameMetrics': {
            'gameType': payload.gameType or 'AirlineManager4',
            'fleetSize': payload.fleetSize or 0,
            'dailyPassengers': payload.dailyPassengers or 0,
            'airportFocus': payload.airportFocus or 'unbekannt',
            'strategy': payload.strategy or 'Standardstrategie',
        },
        'owner': payload.email,
    }
    items = user_custom_stocks.setdefault(payload.email, [])
    items.append(stock)
    return {'message': 'Asset gespeichert', 'stock': stock}


@router.get('/{symbol}')
def get_stock(symbol: str, user: str | None = Query(None, title='User email', description='Optional user email for user-specific stocks')) -> dict[str, Any]:
    stock = find_stock(symbol, user)
    if stock is None:
        raise HTTPException(status_code=404, detail='not found')
    return {
        **stock,
        'description': stock.get('description', 'Beispielunternehmen für die Demo-Anwendung.'),
        'news': ['KI hebt Wachstumspotenzial hervor', 'Analysten erhöhen Zielpreis'],
    }


@router.get('/{symbol}/history')
def get_history(symbol: str, user: str | None = Query(None, title='User email', description='Optional user email for user-specific stocks')) -> list[dict[str, float]]:
    stock = find_stock(symbol, user)
    if stock is None:
        raise HTTPException(status_code=404, detail='not found')

    values = stock.get('history') or [float(stock.get('price', 0))]
    history: list[dict[str, float]] = []
    start = date.today() - timedelta(days=len(values) - 1)
    for index, value in enumerate(values):
        current_date = start + timedelta(days=index)
        history.append({'date': current_date.strftime('%Y-%m-%d'), 'close': float(value)})
    return history


@router.get('/{symbol}/news')
def get_news(symbol: str) -> list[dict[str, str]]:
    return [
        {'title': f'{symbol} gewinnt an Dynamik', 'summary': 'Aktien zeigen positive Impulse aus dem Markt.'},
        {'title': f'{symbol} bleibt im Fokus institutioneller Anleger', 'summary': 'Volumen und Momentum bleiben stabil.'},
    ]
