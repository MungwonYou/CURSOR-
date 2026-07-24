/**
 * Lightweight ensemble "AI" — SMA crossover, RSI, momentum, regression, volatility.
 */

function sma(values, period) {
  const out = new Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

function ema(values, period) {
  const out = new Array(values.length).fill(null);
  const k = 2 / (period + 1);
  let prev = null;
  for (let i = 0; i < values.length; i += 1) {
    if (i < period - 1) continue;
    if (prev == null) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j += 1) sum += values[j];
      prev = sum / period;
    } else {
      prev = values[i] * k + prev * (1 - k);
    }
    out[i] = prev;
  }
  return out;
}

function rsi(values, period = 14) {
  const out = new Array(values.length).fill(null);
  if (values.length <= period) return out;

  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i += 1) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gain += diff;
    else loss -= diff;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < values.length; i += 1) {
    const diff = values[i] - values[i - 1];
    const g = diff > 0 ? diff : 0;
    const l = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

function linearRegression(values, lookback) {
  const n = Math.min(lookback, values.length);
  const start = values.length - n;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i += 1) {
    const x = i;
    const y = values[start + i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }
  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept, n };
}

function stdev(values, period) {
  const slice = values.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
  const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length;
  return Math.sqrt(variance);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function scoreToTone(score) {
  if (score > 0.18) return "bull";
  if (score < -0.18) return "bear";
  return "neutral";
}

/**
 * @param {{ close: number, date: Date }[]} bars
 * @param {number} horizonDays
 */
export function runPrediction(bars, horizonDays = 14) {
  const closes = bars.map((b) => b.close);
  const last = closes[closes.length - 1];
  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const rsi14 = rsi(closes, 14);
  const reg = linearRegression(closes, 40);
  const vol = stdev(closes, 20) / last;

  const i = closes.length - 1;
  const s20 = sma20[i];
  const s50 = sma50[i];
  const e12 = ema12[i];
  const e26 = ema26[i];
  const r = rsi14[i];

  // Component scores in [-1, 1]
  const trendScore = clamp(((s20 - s50) / last) / 0.04, -1, 1);
  const macdScore = clamp(((e12 - e26) / last) / 0.03, -1, 1);
  const rsiAdj =
    r == null
      ? 0
      : r > 70
        ? clamp((70 - r) / 20, -1, 0)
        : r < 30
          ? clamp((30 - r) / 20, 0, 1)
          : clamp((r - 50) / 25, -1, 1);

  const mom10 = closes.length > 10 ? (last - closes[i - 10]) / closes[i - 10] : 0;
  const momScore = clamp(mom10 / 0.08, -1, 1);
  const regScore = clamp((reg.slope * 10) / last / 0.02, -1, 1);

  const weights = {
    trend: 0.28,
    macd: 0.22,
    rsi: 0.18,
    momentum: 0.18,
    regression: 0.14,
  };

  const components = [
    {
      id: "trend",
      name: "SMA 20/50",
      score: trendScore,
      value: s20 && s50 ? `${((s20 / s50 - 1) * 100).toFixed(2)}%` : "—",
      note: s20 >= s50 ? "단기 이평이 장기 위" : "단기 이평이 장기 아래",
      weight: weights.trend,
    },
    {
      id: "macd",
      name: "EMA 모멘텀",
      score: macdScore,
      value: e12 && e26 ? ((e12 - e26) / last * 100).toFixed(2) + "%" : "—",
      note: macdScore >= 0 ? "단기 모멘텀 우위" : "단기 모멘텀 약화",
      weight: weights.macd,
    },
    {
      id: "rsi",
      name: "RSI (14)",
      score: rsiAdj,
      value: r == null ? "—" : r.toFixed(1),
      note:
        r > 70 ? "과매수 구간" : r < 30 ? "과매도 구간" : "중립~추세 구간",
      weight: weights.rsi,
    },
    {
      id: "momentum",
      name: "10일 모멘텀",
      score: momScore,
      value: `${(mom10 * 100).toFixed(2)}%`,
      note: momScore >= 0 ? "단기 상승 압력" : "단기 하락 압력",
      weight: weights.momentum,
    },
    {
      id: "regression",
      name: "추세 회귀",
      score: regScore,
      value: `${((reg.slope / last) * 100).toFixed(3)}%/일`,
      note: regScore >= 0 ? "선형 추세 상향" : "선형 추세 하향",
      weight: weights.regression,
    },
  ];

  const ensemble = components.reduce((acc, c) => acc + c.score * c.weight, 0);
  const agreement =
    components.filter((c) => Math.sign(c.score) === Math.sign(ensemble) || Math.abs(c.score) < 0.1)
      .length / components.length;

  // Dampen expected move by volatility; avoid overconfident jumps
  const expectedMove = ensemble * (0.04 + vol * 1.8) * Math.sqrt(horizonDays / 14);
  const target = last * (1 + expectedMove);
  const confidence = clamp(
    0.35 + Math.abs(ensemble) * 0.4 + agreement * 0.25 - vol * 0.5,
    0.28,
    0.88
  );

  let signal = "HOLD";
  if (ensemble > 0.22 && confidence > 0.45) signal = "BUY";
  else if (ensemble < -0.22 && confidence > 0.45) signal = "SELL";

  // Project path with mean-reverting noise scaled by vol
  const path = [];
  const lastDate = bars[bars.length - 1].date;
  let px = last;
  const dailyDrift = expectedMove / horizonDays;
  for (let d = 1; d <= horizonDays; d += 1) {
    const t = d / horizonDays;
    const pull = (target - px) * 0.12;
    const noise = Math.sin(d * 1.7 + ensemble * 3) * vol * last * 0.15 * (1 - t * 0.4);
    px = px * (1 + dailyDrift * 0.35) + pull + noise;
    const date = new Date(lastDate);
    date.setDate(date.getDate() + d);
    // skip weekends roughly
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
    path.push({ date, close: px });
  }
  // Anchor end to target softly
  path[path.length - 1].close = target * 0.65 + path[path.length - 1].close * 0.35;

  const direction =
    expectedMove > 0.008 ? "상승" : expectedMove < -0.008 ? "하락" : "횡보";

  const summaryParts = [
    signal === "BUY"
      ? "매수 우위 시그널입니다."
      : signal === "SELL"
        ? "매도 우위 시그널입니다."
        : "관망(홀드) 구간에 가깝습니다.",
    `앙상블 점수 ${ensemble >= 0 ? "+" : ""}${(ensemble * 100).toFixed(0)},`,
    `변동성 ${(vol * 100).toFixed(1)}%를 반영했습니다.`,
  ];

  return {
    last,
    target,
    expectedMove,
    confidence,
    signal,
    direction,
    ensemble,
    volatility: vol,
    path,
    components: components.map((c) => ({
      ...c,
      tone: scoreToTone(c.score),
    })),
    summary: summaryParts.join(" "),
    rsi: r,
  };
}
