# Moritz AI Stock Tracker - Backend

FastAPI Backend für die Aktienanalyse mit KI-Prognosen.

## Features

- Echtzeit-Aktiendaten (AAPL, NVDA, MSFT und benutzerdefinierte Assets)
- KI-basierte Preisvorhersagen mit RSI, MACD, EMA/SMA
- Benutzer-Authentifizierung und Watchlist
- Benutzerdefinierte Spiel-Assets (AirlineManager4, etc.)
- CORS-aktiviert für Frontend-Integration

## Installation

```bash
# Virtuelle Umgebung erstellen
python -m venv .venv

# Aktivieren
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Abhängigkeiten installieren
pip install -r requirements.txt
```

## Lokal starten

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API läuft auf: http://localhost:8000

Swagger Docs: http://localhost:8000/docs

## Endpoints

- `GET /stocks` - Alle Aktien (mit optionalem Filter)
- `GET /stocks/{symbol}` - Details einer Aktie
- `GET /stocks/{symbol}/history` - Kurshistorie
- `GET /stocks/{symbol}/news` - Nachrichten
- `POST /stocks/custom` - Benutzerdefiniertes Asset erstellen
- `GET /predictions/{symbol}` - KI-Prognose
- `POST /auth/register` - Benutzer registrieren
- `POST /auth/login` - Anmelden
- `GET /watchlist/{email}` - Watchlist abrufen
- `POST /watchlist/add` - Asset zur Watchlist hinzufügen
- `DELETE /watchlist/remove` - Asset entfernen

## Deployment

Railway: Siehe [DEPLOYMENT.md](../DEPLOYMENT.md)

## Technologie

- FastAPI 0.115.0
- Uvicorn 0.32.0
- NumPy 2.1.0
- Pydantic 2.10.1
