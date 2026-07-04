from fastapi import APIRouter
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

from app.routes.stocks import find_stock

router = APIRouter(prefix='/predictions', tags=['predictions'])


def build_features(history: list[float]) -> tuple[np.ndarray, np.ndarray]:
    series = np.asarray(history, dtype=float)
    if len(series) < 10:
        series = np.full(10, series[-1], dtype=float)

    close = series
    returns = np.zeros_like(close)
    returns[1:] = np.diff(close) / close[:-1]

    def ema(values: np.ndarray, span: int) -> np.ndarray:
        alpha = 2 / (span + 1)
        result = np.empty_like(values)
        result[0] = values[0]
        for i in range(1, len(values)):
            result[i] = alpha * values[i] + (1 - alpha) * result[i - 1]
        return result

    def rolling_mean(values: np.ndarray, window: int) -> np.ndarray:
        if len(values) < window:
            return np.full(len(values), np.nan)
        result = np.full(len(values), np.nan)
        for i in range(window - 1, len(values)):
            result[i] = values[i - window + 1:i + 1].mean()
        return result

    def rolling_std(values: np.ndarray, window: int) -> np.ndarray:
        if len(values) < window:
            return np.full(len(values), np.nan)
        result = np.full(len(values), np.nan)
        for i in range(window - 1, len(values)):
            result[i] = values[i - window + 1:i + 1].std(ddof=0)
        return result

    rsi = np.full_like(close, np.nan)
    if len(close) >= 14:
        avg_gain = np.zeros(len(close))
        avg_loss = np.zeros(len(close))
        gains = np.maximum(returns, 0)
        losses = np.maximum(-returns, 0)
        avg_gain[13] = gains[:14].mean()
        avg_loss[13] = losses[:14].mean()
        for i in range(14, len(close)):
            avg_gain[i] = (avg_gain[i - 1] * 13 + gains[i]) / 14
            avg_loss[i] = (avg_loss[i - 1] * 13 + losses[i]) / 14
        rs = np.divide(avg_gain, avg_loss, out=np.zeros_like(avg_gain), where=avg_loss != 0)
        rsi = 100 - (100 / (1 + rs))

    ema_12 = ema(close, 12)
    sma_20 = rolling_mean(close, 20)
    volatility = rolling_std(returns, 10)

    target = np.zeros(len(close), dtype=int)
    target[:-1] = (close[1:] > close[:-1]).astype(int)

    valid = ~np.isnan(np.vstack((returns, rsi, ema_12, sma_20, volatility)).T).any(axis=1)
    valid = valid[:-1]

    features = np.column_stack((
        returns[:-1][valid],
        rsi[:-1][valid],
        ema_12[:-1][valid],
        sma_20[:-1][valid],
        volatility[:-1][valid],
    ))
    target = target[:-1][valid]

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
