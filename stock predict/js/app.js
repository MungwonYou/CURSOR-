import { loadStock } from "./data.js";
import { runPrediction } from "./predict.js";
import { drawChart } from "./chart.js";

const form = document.getElementById("search-form");
const input = document.getElementById("ticker-input");
const horizonEl = document.getElementById("horizon");
const predictBtn = document.getElementById("predict-btn");
const workspace = document.getElementById("workspace");
const indicators = document.getElementById("indicators");
const indicatorGrid = document.getElementById("indicator-grid");
const chartStatus = document.getElementById("chart-status");
const canvas = document.getElementById("price-chart");
const quickPicks = document.getElementById("quick-picks");

function formatPrice(value, currency) {
  try {
    return new Intl.NumberFormat(currency === "KRW" ? "ko-KR" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "KRW" ? 0 : 2,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

function formatPct(v) {
  const sign = v > 0 ? "+" : "";
  return `${sign}${(v * 100).toFixed(2)}%`;
}

function setActivePick(ticker) {
  quickPicks.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.ticker === ticker);
  });
}

function showStatus(msg) {
  chartStatus.hidden = !msg;
  chartStatus.textContent = msg || "";
}

function renderSignal(stock, pred) {
  const badge = document.getElementById("signal-badge");
  badge.textContent = pred.signal;
  badge.classList.remove("is-buy", "is-sell", "is-hold");
  badge.classList.add(
    pred.signal === "BUY" ? "is-buy" : pred.signal === "SELL" ? "is-sell" : "is-hold"
  );

  document.getElementById("stat-direction").textContent = pred.direction;
  document.getElementById("stat-target").textContent = formatPrice(
    pred.target,
    stock.currency
  );
  const moveEl = document.getElementById("stat-move");
  moveEl.textContent = formatPct(pred.expectedMove);
  moveEl.className = pred.expectedMove >= 0 ? "is-up" : "is-down";
  // keep dd styling via parent — apply color on dd directly
  moveEl.style.color =
    pred.expectedMove > 0.001
      ? "var(--bull)"
      : pred.expectedMove < -0.001
        ? "var(--bear)"
        : "inherit";

  document.getElementById("stat-confidence").textContent =
    `${Math.round(pred.confidence * 100)}%`;
  document.getElementById("confidence-fill").style.width =
    `${Math.round(pred.confidence * 100)}%`;
  document.getElementById("signal-summary").textContent = pred.summary;

  const prev = stock.bars[stock.bars.length - 2]?.close ?? pred.last;
  const chg = (pred.last - prev) / prev;
  document.getElementById("meta-symbol").textContent =
    `${stock.symbol} · ${stock.name}${stock.source === "demo" ? " · DEMO" : ""}`;
  document.getElementById("last-price").textContent = formatPrice(
    pred.last,
    stock.currency
  );
  const chgEl = document.getElementById("last-chg");
  chgEl.textContent = formatPct(chg);
  chgEl.classList.toggle("is-up", chg >= 0);
  chgEl.classList.toggle("is-down", chg < 0);

  indicatorGrid.innerHTML = pred.components
    .map(
      (c) => `
      <li>
        <p class="ind-name">${c.name} · w${Math.round(c.weight * 100)}</p>
        <p class="ind-value is-${c.tone}">${c.value}</p>
        <p class="ind-note">${c.note}</p>
      </li>`
    )
    .join("");
}

let latest = null;

async function run() {
  const ticker = input.value.trim().toUpperCase();
  const horizon = Number(horizonEl.value) || 14;
  if (!ticker) return;

  setActivePick(ticker);
  predictBtn.disabled = true;
  predictBtn.querySelector("span").textContent = "분석 중…";
  workspace.hidden = false;
  indicators.hidden = false;
  showStatus("시세 불러오는 중…");

  try {
    const stock = await loadStock(ticker);
    const pred = runPrediction(stock.bars, horizon);
    latest = { stock, pred };
    renderSignal(stock, pred);
    showStatus("");
    drawChart(canvas, stock.bars, pred.path, stock.currency);
  } catch (err) {
    console.error(err);
    showStatus(err.message || "예측에 실패했습니다.");
  } finally {
    predictBtn.disabled = false;
    predictBtn.querySelector("span").textContent = "예측 실행";
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  run();
});

quickPicks.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-ticker]");
  if (!btn) return;
  input.value = btn.dataset.ticker;
  run();
});

window.addEventListener("resize", () => {
  if (!latest) return;
  drawChart(canvas, latest.stock.bars, latest.pred.path, latest.stock.currency);
});

// Auto-run default ticker on load
run();
