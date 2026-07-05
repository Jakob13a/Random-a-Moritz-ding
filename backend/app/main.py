from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import stocks, predictions, auth, watchlist

app = FastAPI(title='Moritz AI Stock Tracker API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(stocks.router)
app.include_router(predictions.router)
app.include_router(auth.router)
app.include_router(watchlist.router)

@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}
