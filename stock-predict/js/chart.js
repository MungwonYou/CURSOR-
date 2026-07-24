/**
 * Canvas price chart — history + predicted path.
 */

function formatAxisPrice(v, currency) {
  if (currency === "KRW") {
    if (v >= 10000) return `${Math.round(v / 1000)}k`;
    return String(Math.round(v));
  }
  if (v >= 1000) return v.toFixed(0);
  if (v >= 100) return v.toFixed(1);
  return v.toFixed(2);
}

export function drawChart(canvas, history, prediction, currency = "USD") {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 960;
  const cssH = Math.max(280, Math.round(cssW * 0.42));
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const pad = { top: 16, right: 56, bottom: 28, left: 12 };
  const w = cssW - pad.left - pad.right;
  const h = cssH - pad.top - pad.bottom;

  const hist = history.map((b) => b.close);
  const pred = prediction.map((b) => b.close);
  const all = hist.concat(pred);
  let min = Math.min(...all);
  let max = Math.max(...all);
  const padY = (max - min) * 0.08 || max * 0.02;
  min -= padY;
  max += padY;

  const total = hist.length + pred.length - 1;
  const xAt = (i) => pad.left + (i / total) * w;
  const yAt = (v) => pad.top + ((max - v) / (max - min)) * h;

  ctx.clearRect(0, 0, cssW, cssH);

  // grid
  ctx.strokeStyle = "rgba(12, 26, 36, 0.08)";
  ctx.lineWidth = 1;
  for (let g = 0; g <= 4; g += 1) {
    const y = pad.top + (h * g) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + w, y);
    ctx.stroke();
    const val = max - ((max - min) * g) / 4;
    ctx.fillStyle = "rgba(58, 81, 96, 0.85)";
    ctx.font = "11px 'IBM Plex Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(formatAxisPrice(val, currency), pad.left + w + 8, y + 4);
  }

  // split marker
  const splitX = xAt(hist.length - 1);
  ctx.strokeStyle = "rgba(26, 107, 181, 0.35)";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(splitX, pad.top);
  ctx.lineTo(splitX, pad.top + h);
  ctx.stroke();
  ctx.setLineDash([]);

  // history area fill
  ctx.beginPath();
  hist.forEach((v, i) => {
    const x = xAt(i);
    const y = yAt(v);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(xAt(hist.length - 1), pad.top + h);
  ctx.lineTo(xAt(0), pad.top + h);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + h);
  grad.addColorStop(0, "rgba(12, 26, 36, 0.14)");
  grad.addColorStop(1, "rgba(12, 26, 36, 0)");
  ctx.fillStyle = grad;
  ctx.fill();

  // history line
  ctx.beginPath();
  hist.forEach((v, i) => {
    const x = xAt(i);
    const y = yAt(v);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#0c1a24";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke();

  // prediction dashed
  ctx.beginPath();
  ctx.moveTo(xAt(hist.length - 1), yAt(hist[hist.length - 1]));
  pred.forEach((v, i) => {
    ctx.lineTo(xAt(hist.length + i), yAt(v));
  });
  ctx.strokeStyle = "#1a6bb5";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  // end dots
  const lastHist = { x: xAt(hist.length - 1), y: yAt(hist[hist.length - 1]) };
  const lastPred = { x: xAt(hist.length + pred.length - 1), y: yAt(pred[pred.length - 1]) };

  ctx.fillStyle = "#0c1a24";
  ctx.beginPath();
  ctx.arc(lastHist.x, lastHist.y, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1a6bb5";
  ctx.beginPath();
  ctx.arc(lastPred.x, lastPred.y, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(58, 81, 96, 0.9)";
  ctx.font = "11px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("오늘", splitX, cssH - 8);
  ctx.textAlign = "right";
  ctx.fillText("예측", lastPred.x, cssH - 8);
}
