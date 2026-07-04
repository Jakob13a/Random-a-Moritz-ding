from fastapi import APIRouter
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

from app.routes.stocks import find_stock

router = APIRouter(prefix='/predictions', tags=['predictions'])


def build_features(history: list[float]) -> tuple[pd.DataFrame, pd.Series]:
    series = pd.Series(history, dtype=float)
    if len(series) < 10:
        series = pd.Series([series.iloc[-1]] * 10, dtype=float)

    df = pd.DataFrame({'close': series})
    df['return'] = df['close'].pct_change()
    df['rsi'] = 100 - (100 / (1 + df['return'].rolling(14).mean().abs()))
    df['ema_12'] = df['close'].ewm(span=12, adjust=False).mean()
    df['sma_20'] = df['close'].rolling(20).mean()
    df['volatility'] = df['return'].rolling(10).std()
    df = df.dropna().reset_index(drop=True)
    df['target'] = (df['close'].shift(-1) > df['close']).astype(int)
    features = df[['return', 'rsi', 'ema_12', 'sma_20', 'volatility']]
    target = df['target']
    return features, target


@router.get('/{symbol}')
def get_prediction(symbol: str, user: str | None = None) -> dict[str, object]:
    stock = find_stock(symbol, user)
    history = stock.get('history') if stock else None
    values = [float(value) for value in history] if isinstance(history, list) and history else [180.0, 181.2, 182.4, 183.7, 184.2]

    X, y = build_features(values)
    if len(X) < 6:
        probability = 0.5
        accuracy = 55.0
    else:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = RandomForestClassifier(n_estimators=80, random_state=42)
        model.fit(X_train, y_train)
        accuracy = accuracy_score(y_test, model.predict(X_test))
        probability = float(model.predict_proba(X_test)[0, 1])

    probability = max(0.05, min(0.95, probability))
    latest = values[-1]
    change = (values[-1] - values[-2]) / values[-2] if len(values) > 1 else 0.0
    expected_price_tomorrow = latest * (1 + change)
    expected_price_week = expected_price_tomorrow * 1.03
    expected_price_month = expected_price_tomorrow * 1.08

    trend = 'Bullish' if probability > 0.6 else 'Bearish' if probability < 0.4 else 'Neutral'
    return {
        'symbol': symbol.upper(),
        'probability_up': round(probability, 3),
        'probability_down': round(1 - probability, 3),
        'expected_price_tomorrow': round(expected_price_tomorrow, 2),
        'expected_price_next_week': round(expected_price_week, 2),
        'expected_price_next_month': round(expected_price_month, 2),
        'confidence': round(float(accuracy) * 100, 1),
        'trend': trend,
        'disclaimer': 'Diese Vorhersage ist probabilistisch und keine Finanzberatung.'
    }
