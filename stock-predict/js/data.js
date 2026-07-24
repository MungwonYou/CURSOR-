/**
 * Fetch daily OHLCV. Tries Yahoo Finance via CORS proxies, then falls back to demo series.
 */

const PROXY_BUILDERS = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

function yahooChartUrl(symbol, range = "6mo") {
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}&includePrePost=false`;
}

function parseYahooPayload(payload, symbol) {
  const result = payload?.chart?.result?.[0];
  if (!result) throw new Error("티커 데이터를 찾을 수 없습니다.");

  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0] || {};
  const closes = quote.close || [];
  const highs = quote.high || [];
  const lows = quote.low || [];
  const volumes = quote.volume || [];
  const meta = result.meta || {};

  const bars = [];
  for (let i = 0; i < timestamps.length; i += 1) {
    const close = closes[i];
    if (close == null || Number.isNaN(close)) continue;
    bars.push({
      date: new Date(timestamps[i] * 1000),
      close: Number(close),
      high: Number(highs[i] ?? close),
      low: Number(lows[i] ?? close),
      volume: Number(volumes[i] ?? 0),
    });
  }

  if (bars.length < 40) throw new Error("분석에 필요한 일봉이 부족합니다.");

  return {
    symbol: meta.symbol || symbol,
    name: meta.shortName || meta.longName || meta.symbol || symbol,
    currency: meta.currency || "USD",
    exchange: meta.exchangeName || meta.fullExchangeName || "",
    bars,
    source: "yahoo",
  };
}

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function loadStock(symbol) {
  const ticker = symbol.trim().toUpperCase();
  if (!ticker) throw new Error("티커를 입력하세요.");

  const target = yahooChartUrl(ticker);
  let lastError = null;

  for (const build of PROXY_BUILDERS) {
    try {
      const payload = await fetchJson(build(target));
      return parseYahooPayload(payload, ticker);
    } catch (err) {
      lastError = err;
    }
  }

  // Direct attempt (works in some environments)
  try {
    const payload = await fetchJson(target);
    return parseYahooPayload(payload, ticker);
  } catch (err) {
    lastError = err;
  }

  console.warn("Live fetch failed, using demo series:", lastError);
  return buildDemoSeries(ticker);
}

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildDemoSeries(symbol) {
  const rand = mulberry32(hashSeed(symbol));
  const bases = {
    AAPL: 190,
    NVDA: 120,
    TSLA: 250,
    MSFT: 420,
    GOOGL: 175,
    AMZN: 185,
    META: 510,
    "005930.KS": 72000,
    "000660.KS": 190000,
  };
  let price = bases[symbol] || 80 + (hashSeed(symbol) % 200);
  const isKr = symbol.endsWith(".KS") || symbol.endsWith(".KQ");
  const bars = [];
  const start = new Date();
  start.setDate(start.getDate() - 180);

  for (let i = 0; i < 140; i += 1) {
    const drift = (rand() - 0.48) * 0.025;
    const shock = rand() > 0.97 ? (rand() - 0.5) * 0.06 : 0;
    price = Math.max(price * (1 + drift + shock), price * 0.4);
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const high = price * (1 + rand() * 0.012);
    const low = price * (1 - rand() * 0.012);
    bars.push({
      date,
      close: Number(price.toFixed(isKr ? 0 : 2)),
      high: Number(high.toFixed(isKr ? 0 : 2)),
      low: Number(low.toFixed(isKr ? 0 : 2)),
      volume: Math.floor(1e6 + rand() * 5e6),
    });
  }

  return {
    symbol,
    name: `${symbol} (데모)`,
    currency: isKr ? "KRW" : "USD",
    exchange: "DEMO",
    bars,
    source: "demo",
  };
}
