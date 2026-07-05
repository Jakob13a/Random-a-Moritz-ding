from fastapi import APIRouter
import numpy as np

from app.routes.stocks import find_stock

router = APIRouter(prefix='/predictions', tags=['predictions'])


def compute_prediction(history: list[float]) -> dict[str, float]:
    series = np.asarray(history, dtype=float)
    if len(series) < 2:
        return {
            'probability': 0.5,
            'confidence': 0.55,
            'trend_strength': 0.0,
            'volatility': 0.0,
        }

    if len(series) < 10:
        series = np.pad(series, (10 - len(series), 0), mode='edge')

    returns = np.zeros_like(series)
    returns[1:] = np.diff(series) / series[:-1]
    momentum = float(returns[-1])
    trend = float((series[-1] - series[-5]) / series[-5]) if len(series) >= 5 else momentum
    volatility = float(np.std(returns[-10:], ddof=0))

    rsi = 50.0
    if len(series) >= 14:
        gains = np.maximum(returns, 0)
        losses = np.maximum(-returns, 0)
        avg_gain = np.convolve(gains, np.ones(14) / 14, mode='valid')
        avg_loss = np.convolve(losses, np.ones(14) / 14, mode='valid')
        if avg_loss.size and avg_loss[-1] != 0:
            rs = avg_gain[-1] / avg_loss[-1]
            rsi = 100 - (100 / (1 + rs))

    score = 0.5 + 0.35 * np.tanh(trend * 5) + 0.15 * np.tanh(momentum * 10) + 0.1 * ((rsi - 50) / 100)
    score = float(np.clip(score, 0.05, 0.95))
    confidence = float(np.clip(0.4 + 0.3 * (1 - min(volatility, 1.0)) + 0.15 * abs(score - 0.5), 0.4, 0.9))

    return {
        'probability': score,
        'confidence': confidence,
        'trend_strength': trend,
        'volatility': volatility,
    }


@router.get('/{symbol}')
def get_prediction(symbol: str, user: str | None = None) -> dict[str, object]:
    stock = find_stock(symbol, user)
    history = stock.get('history') if stock else None
    values = [float(value) for value in history] if isinstance(history, list) and history else [180.0, 181.2, 182.4, 183.7, 184.2]

    prediction = compute_prediction(values)
    probability = prediction['probability']
    accuracy = prediction['confidence'] * 100.0

    latest = values[-1]
    change = (values[-1] - values[-2]) / values[-2] if len(values) > 1 else 0.0
    expected_price_tomorrow = latest * (1 + change)
    expected_price_week = expected_price_tomorrow * 1.03
    expected_price_month = expected_price_tomorrow * 1.08

    trend_label = 'Bullish' if probability > 0.6 else 'Bearish' if probability < 0.4 else 'Neutral'
    return {
        'symbol': symbol.upper(),
        'probability_up': round(probability, 3),
        'probability_down': round(1 - probability, 3),
        'expected_price_tomorrow': round(expected_price_tomorrow, 2),
        'expected_price_next_week': round(expected_price_week, 2),
        'expected_price_next_month': round(expected_price_month, 2),
        'confidence': round(accuracy, 1),
        'trend': trend_label,
        'disclaimer': 'Diese Vorhersage ist probabilistisch und keine Finanzberatung.',
    }
