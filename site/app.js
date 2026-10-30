const D = window.DATA;
document.documentElement.classList.add("js");
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const $ = id => document.getElementById(id);
const CATS = ["All", "CPU", "GPU", "Storage", "Networking"];
const charts = {};
const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

function chips(el, items, active, onPick) {
  el.innerHTML = "";
  items.forEach(it => {
    const b = document.createElement("button");
    b.className = "chip"; b.textContent = it; b.setAttribute("aria-pressed", it === active);
    b.onclick = () => { onPick(it); chips(el, items, it, onPick); };
    el.appendChild(b);
  });
}
const VIV = ["#4cc9ff", "#ff9f43", "#2ee6a6", "#a78bfa", "#ff5d73", "#ffd166", "#5eead4", "#f472b6", "#94a3b8"];
function grad(ctx, c1, c2, h = 300) {
  const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, c1); g.addColorStop(1, c2); return g;
}
// gradient for horizontal bars: dark at the base, bright at the tip
const SENT = { positive: ["#2ee6a6", "#0c7d5c"], neutral: ["#a9b8d0", "#58667d"], negative: ["#ff6b81", "#b4213e"] };
const barGrad = ([hi, lo]) => ctx => {
  const el = ctx.element; if (!el || !ctx.chart.chartArea) return hi;
  const { x, base } = el.getProps(["x", "base"], true);
  if (!Number.isFinite(x) || !Number.isFinite(base)) return hi;
  const g = ctx.chart.ctx.createLinearGradient(base, 0, x, 0); g.addColorStop(0, lo); g.addColorStop(1, hi); return g;
};
const sentDatasets = (rows, valueOf) => ["positive", "neutral", "negative"].map(k => ({
  label: k[0].toUpperCase() + k.slice(1), data: rows.map(r => valueOf(r, k)), backgroundColor: barGrad(SENT[k]), borderWidth: 0,
}));
// value labels inside stacked bar segments
const barLabels = { id: "barLabels", afterDatasetsDraw(chart) {
  const { ctx } = chart; ctx.save(); ctx.font = "600 11px Inter, system-ui, sans-serif"; ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  chart.data.datasets.forEach((ds, i) => chart.getDatasetMeta(i).data.forEach((bar, j) => {
    const w = Math.abs(bar.x - bar.base); if (w > 34 && ds.data[j] != null) ctx.fillText(Math.round(ds.data[j]) + "%", (bar.x + bar.base) / 2, bar.y);
  })); ctx.restore();
} };
// soft glow under lines
const glow = { id: "glow",
  beforeDatasetDraw(chart, args) { const c = chart.data.datasets[args.index].borderColor; if (typeof c === "string") { chart.ctx.save(); chart.ctx.shadowColor = c; chart.ctx.shadowBlur = 14; } },
  afterDatasetDraw(chart, args) { if (typeof chart.data.datasets[args.index].borderColor === "string") chart.ctx.restore(); } };
// vertical hover guide
const crosshair = { id: "crosshair", afterDatasetsDraw(chart) {
  const act = chart.tooltip && chart.tooltip.getActiveElements(); if (!act || !act.length) return;
  const { ctx, chartArea: { top, bottom } } = chart, x = act[0].element.x;
  ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke(); ctx.restore();
} };
const areaFill = col => ctx => {
  const { chart } = ctx; if (!chart.chartArea) return null;
  const g = chart.ctx.createLinearGradient(0, chart.chartArea.top, 0, chart.chartArea.bottom); g.addColorStop(0, col + "66"); g.addColorStop(1, col + "00"); return g;
};
const centerText = (big, small) => ({ id: "centerText", afterDraw(chart) {
  const { ctx, chartArea: { left, right, top, bottom } } = chart, x = (left + right) / 2, y = (top + bottom) / 2;
  ctx.save(); ctx.textAlign = "center"; ctx.fillStyle = css("--ink"); ctx.font = "800 26px Inter, system-ui, sans-serif"; ctx.fillText(big, x, y + 4);
  ctx.fillStyle = css("--muted"); ctx.font = "12px Inter, system-ui, sans-serif"; ctx.fillText(small, x, y + 22); ctx.restore();
} });
const GRID = { color: "rgba(140,160,220,.10)", drawTicks: false };
function draw(id, cfg) {
  if (charts[id]) charts[id].destroy();
  Object.assign(Chart.defaults.plugins.tooltip, { backgroundColor: "rgba(8,12,28,.96)", borderColor: "rgba(76,201,255,.45)", borderWidth: 1, padding: 12, cornerRadius: 10, boxPadding: 5, usePointStyle: true, titleFont: { weight: "700", size: 13 }, bodySpacing: 6 });
  Chart.defaults.plugins.legend.labels.padding = 18;
  Chart.defaults.datasets.bar.maxBarThickness = 34;
  Chart.defaults.datasets.bar.categoryPercentage = .8;
  Chart.defaults.color = css("--muted");
  Chart.defaults.borderColor = "rgba(140,160,220,.12)";
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.boxWidth = 8;
  Chart.defaults.elements.bar.borderRadius = 6;
  Chart.defaults.elements.bar.borderSkipped = false;
  Chart.defaults.animation.duration = 700;
  charts[id] = new Chart($(id), cfg);
}

// ---- Overview
const rated = D.products.filter(p => !p.limited);   // ignore products with very few reviews
const best = [...rated].sort((a, b) => b.positive - a.positive)[0];
const worst = [...rated].sort((a, b) => b.negative - a.negative)[0];
const overallPos = D.products.reduce((s, p) => s + p.positive * p.count, 0) / D.meta.total;
$("kpis").innerHTML = [
  [D.meta.total.toLocaleString(), "reviews analysed"],
  [overallPos.toFixed(0) + "%", "positive overall"],
  [best.name, `most loved (${best.positive}% positive)`],
  [worst.name, `most criticised (${worst.negative}% negative)`],
  [(D.metrics.accuracy * 100).toFixed(1) + "%", "baseline model accuracy"],
].map(([v, l]) => `<div class="kpi"><b>${v}</b><span>${l}</span></div>`).join("");

// ---- Products
function renderProducts(cat) {
  const ps = D.products.filter(p => cat === "All" || p.category === cat);
  $("productCards").innerHTML = ps.map(p => `<div class="pcard"><div class="ring" style="--p:${p.positive};--n:${p.negative}"><i>${Math.round(p.positive)}%</i></div>
    <div><span class="cat">${p.category}</span><b>${p.name}</b><small>${p.count} reviews · ${p.avgRating}★${p.limited ? " · limited data" : ""}</small></div></div>`).join("");
  draw("productChart", {
    type: "bar",
    data: {
      labels: ps.map(p => p.name),
      datasets: sentDatasets(ps, (p, k) => p[k]),
    },
    plugins: [barLabels],
    options: {
      indexAxis: "y", responsive: true,
      scales: { x: { stacked: true, max: 100, grid: GRID, border: { display: false }, ticks: { callback: v => v + "%" } }, y: { stacked: true, grid: { display: false }, border: { display: false } } },
      plugins: { tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.raw}%` } } },
    },
  });
}
chips($("catChips"), CATS, "All", renderProducts); renderProducts("All");

// ---- Trends
let trendMode = "Category";
function renderTrend(mode) {
  trendMode = mode;
  const src = mode === "Category" ? D.trendCategories : D.trendProducts;
  const palette = VIV;
  draw("trendChart", {
    type: "line",
    data: {
      labels: D.quarters,
      datasets: Object.entries(src).map(([k, v], i) => ({
        label: k, data: v, borderColor: palette[i % palette.length],
        tension: .4, fill: mode === "Category" ? "origin" : false, backgroundColor: areaFill(palette[i % palette.length]),
        pointRadius: 0, pointHoverRadius: 6, pointHoverBorderWidth: 3, pointHoverBorderColor: "#fff", pointHoverBackgroundColor: palette[i % palette.length], borderWidth: 3, spanGaps: true,
      })),
    },
    plugins: [glow, crosshair],
    options: { interaction: { mode: "index", intersect: false },
      scales: { y: { title: { display: true, text: "Net sentiment (pts)" }, grid: GRID, border: { display: false } }, x: { ticks: { maxTicksLimit: 12 }, grid: { display: false }, border: { display: false } } },
      plugins: { tooltip: { itemSort: (p, q) => q.raw - p.raw } } },
  });
  // biggest movers
  const moves = Object.entries(D.trendProducts).map(([k, v]) => {
    const a = v.filter(x => x != null);
    const h = Math.max(1, Math.floor(a.length / 4));
    const early = a.slice(0, h).reduce((s, x) => s + x, 0) / h, late = a.slice(-h).reduce((s, x) => s + x, 0) / h;
    return [k, late - early];
  }).sort((a, b) => b[1] - a[1]);
  const up = moves[0], down = moves[moves.length - 1];
  $("trendNote").textContent = `Biggest improvement: ${up[0]} (${up[1] >= 0 ? "+" : ""}${up[1].toFixed(0)} pts, early vs recent). Biggest decline: ${down[0]} (${down[1].toFixed(0)} pts).`;
}
chips($("trendMode"), ["Category", "Product"], "Category", renderTrend); renderTrend("Category");

// ---- Aspects
function renderAspects(cat) {
  const a = D.aspects[cat];
  draw("aspectChart", {
    type: "bar",
    data: {
      labels: a.map(x => x.aspect),
      datasets: sentDatasets(a, (x, k) => Math.round(100 * x[k] / x.total)),
    },
    plugins: [barLabels],
    options: { indexAxis: "y", scales: { x: { stacked: true, max: 100, grid: GRID, border: { display: false }, ticks: { callback: v => v + "%" } }, y: { stacked: true, grid: { display: false }, border: { display: false } } },
      plugins: { tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.raw}%` } } } },
  });
}
chips($("aspectChips"), CATS, "All", renderAspects); renderAspects("All");

// ---- Keywords
function renderCloud(cat) {
  for (const [lab, el] of [["positive", "cloudPos"], ["negative", "cloudNeg"]]) {
    const kw = D.keywords[cat][lab], max = kw[0][1];
    $(el).innerHTML = kw.map(([w, n]) =>
      `<span class="${lab === "positive" ? "pos" : "neg"}" style="font-size:${(13 + 17 * n / max).toFixed(0)}px" title="${n} reviews">${w}</span>`).join("");
  }
}
chips($("kwChips"), CATS, "All", renderCloud); renderCloud("All");

// ---- Model
const M = D.metrics;
$("metricTiles").innerHTML = [
  [(M.accuracy * 100).toFixed(1) + "%", "Accuracy"], [M.macroF1.toFixed(3), "Macro F1"],
  [M.n.toLocaleString(), "Reviews evaluated"], [M.model, "Model"],
].map(([v, l]) => `<div class="tile"><b style="${v.length > 10 ? "font-size:14px" : ""}">${v}</b><span>${l}</span></div>`).join("");
$("classTable").innerHTML = "<tr><th>Class</th><th>Precision</th><th>Recall</th><th>F1</th><th>Support</th></tr>" +
  M.labels.map(c => { const p = M.perClass[c]; return `<tr><td>${c}</td><td>${p.precision}</td><td>${p.recall}</td><td>${p.f1}</td><td>${p.support}</td></tr>`; }).join("");
const cmMax = Math.max(...M.labels.flatMap(a => M.labels.map(b => M.confusion[a][b])));
$("confusion").innerHTML = `<table class="cm"><tr><th></th>${M.labels.map(l => `<th>${l}</th>`).join("")}</tr>` +
  M.labels.map(a => `<tr><th>${a}</th>${M.labels.map(b => {
    const v = M.confusion[a][b];
    return `<td style="background:color-mix(in srgb,var(--accent) ${Math.round(80 * v / cmMax)}%,transparent)">${v}</td>`;
  }).join("")}</tr>`).join("") + "</table>";

if (M.compare) {
  $("classTable").insertAdjacentHTML("beforebegin", "<table style='margin-bottom:14px'><tr><th>Model compared</th><th>Accuracy</th><th>Macro F1</th></tr>" +
    M.compare.map(c => `<tr><td>${c.model}${c.model === M.model ? " ★" : ""}</td><td>${c.accuracy}</td><td>${c.macroF1}</td></tr>`).join("") + "</table>");
}

// ---- Recommendations
const FIX = {
  "Performance": "Close the gap in real-world workloads, not just peak benchmarks; publish transparent, reproducible performance claims.",
  "Thermals": "Lower thermal density and ship with cooling guidance; reduce reliance on high boost clocks that push temperatures past 90°C.",
  "Power": "Improve performance-per-watt and tune default power limits for efficiency out of the box.",
  "Price / Value": "Reposition pricing against competitors or add value (bundles, longer warranty) where reviewers call products overpriced.",
  "Drivers / Software": "Invest in launch-day driver and firmware quality, with a public roadmap, and fast regression fixes.",
  "Compatibility": "Broaden validated motherboard / OS support (incl. Linux) and remove setup hurdles such as Resizable BAR requirements.",
  "Reliability": "Strengthen validation to avoid instability and early failures; communicate microcode and BIOS fixes proactively.",
  "Connectivity / Speed": "Fix dropouts, latency and range issues in firmware; test across routers and real-world interference.",
};
function renderRecs(cat) {
  const list = D.aspects[cat].filter(a => a.total >= 30)
    .map(a => ({ ...a, score: a.negShare * Math.log(a.total) })).sort((x, y) => y.score - x.score).slice(0, 5);
  $("recList").innerHTML = list.map((a, i) => `<div class="rec"><span class="tag">${a.negShare}% negative · ${a.total} mentions</span>
    <h3>${i + 1}. ${a.aspect}</h3><p>${FIX[a.aspect] || ""}</p></div>`).join("");
}
chips($("recChips"), CATS, "All", renderRecs); renderRecs("All");

// ---- Analyzer (word-list model with negation, same idea as pipeline/build_real.py)
const L = { pos: new Set(D.lexicon.pos), neg: new Set(D.lexicon.neg), not: new Set(D.lexicon.negators) };
const tok = t => t.toLowerCase().replace(/'/g, "").match(/[a-z0-9']+/g) || [];
// words the generated lexicon misses (e.g. "heats up", "overheating")
["fantastic","brilliant","nice","quick","speedy","faster","superb","perfect","responsive","cooler","lovely","satisfied"].forEach(w => L.pos.add(w));
["heats","heat","heated","overheat","overheats","overheating","hotter","noisy","laggy","lag","bad","bug","bugs","crashing","throttle","throttles","pricey","slower","disappoints","unreliable","faulty","defective","waste"].forEach(w => L.neg.add(w));
function analyze(text) {
  const t = tok(text); let score = 0, np = 0, nn = 0; const hits = [];
  t.forEach((w, i) => {
    let s = L.pos.has(w) ? 1 : L.neg.has(w) ? -1 : 0;
    if (s && i > 0 && L.not.has(t[i - 1])) s = -s;
    if (s) { score += s; hits.push([w, s]); s > 0 ? np++ : nn++; }
  });
  // both praise and complaints, and neither clearly dominates -> mixed
  const label = np && nn && Math.abs(score) <= 1 ? "mixed" : score >= 1 ? "positive" : score <= -1 ? "negative" : "neutral";
  return { score, hits, label };
}
$("tryInput").addEventListener("input", e => {
  const v = e.target.value.trim();
  if (!v) { $("tryOut").innerHTML = ""; return; }
  const r = analyze(v);
  $("tryOut").innerHTML = `<span class="badge ${r.label}">${r.label}</span> score ${r.score}` +
    (r.hits.length ? " · " + r.hits.map(([w, s]) => `<mark class="${s > 0 ? "p" : "n"}">${w}</mark>`).join(" ") : " · no sentiment words found");
});

// ---- Submit your own review for a product (kept in this browser only)
const UKEY = "userReviews";
const loadUR = () => { try { return JSON.parse(localStorage.getItem(UKEY)) || []; } catch (e) { return []; } };
window.getUserReviews = name => loadUR().filter(r => r.product === name);
$("urProd").innerHTML = D.products.map(p => `<option>${p.name}</option>`).join("");
$("urSubmit").onclick = () => {
  const text = $("urText").value.trim(); if (!text) { $("urMsg").textContent = "Please write a review first."; return; }
  const name = $("urProd").value, rating = +$("urRating").value, r = analyze(text);
  const rec = { product: name, category: D.products.find(p => p.name === name).category, source: "You", date: new Date().toISOString().slice(0, 10), rating, label: r.label, text, user: true };
  try { localStorage.setItem(UKEY, JSON.stringify([rec, ...loadUR()])); } catch (e) { $("urMsg").textContent = "Could not save in this browser."; return; }
  $("urText").value = ""; $("urMsg").innerHTML = `Saved. Detected sentiment: <span class="badge ${r.label}">${r.label}</span>`;
  if (window.showProductReviews) window.showProductReviews(name, true);
};


// ---- Overview donuts
(() => {
  const tot = D.meta.total;
  const s = ["positive", "neutral", "negative"].map(k => Math.round(D.products.reduce((t, p) => t + p[k] * p.count, 0) / tot * 10) / 10);
  const opt = { cutout: "74%", plugins: { legend: { position: "right" } } };
  draw("donutSent", { type: "doughnut", data: { labels: ["Positive", "Neutral", "Negative"], datasets: [{ data: s, backgroundColor: [SENT.positive[0], SENT.neutral[0], SENT.negative[0]], borderWidth: 0, borderRadius: 8, spacing: 3, hoverOffset: 8 }] }, plugins: [centerText(s[0] + "%", "positive")], options: { ...opt, maintainAspectRatio: false } });
  const src = Object.entries(D.meta.categories);
  draw("donutSrc", { type: "doughnut", data: { labels: src.map(x => x[0]), datasets: [{ data: src.map(x => x[1]), backgroundColor: VIV, borderWidth: 0, borderRadius: 8, spacing: 3, hoverOffset: 8 }] }, plugins: [centerText(tot.toLocaleString(), "reviews")], options: { ...opt, maintainAspectRatio: false } });
})();

// ---- Heatmap
(() => {
  const cats = CATS.slice(1), names = [...new Set(cats.flatMap(c => D.aspects[c].map(a => a.aspect)))];
  const get = (c, n) => D.aspects[c].find(a => a.aspect === n);
  $("heatmap").innerHTML = `<table class="hm"><tr><th></th>${cats.map(c => `<th>${c}</th>`).join("")}</tr>` +
    names.map(n => `<tr><th>${n}</th>${cats.map(c => {
      const x = get(c, n);
      if (!x) return '<td class="na">–</td>';
      return `<td style="background:color-mix(in srgb,var(--neg) ${Math.min(90, Math.round(x.negShare * 2.6))}%,var(--card))">${x.negShare}%</td>`;
    }).join("")}</tr>`).join("") + "</table>";
})();

// ---- count-up KPIs
document.querySelectorAll(".kpi b").forEach(el => {
  const m = el.textContent.match(/^([\d,.]+)(%?)$/);
  if (!m) return;
  const to = parseFloat(m[1].replace(/,/g, "")), dec = (m[1].split(".")[1] || "").length, suf = m[2], t0 = performance.now();
  const step = t => {
    const k = Math.min(1, (t - t0) / 1100), v = to * (1 - Math.pow(1 - k, 3));
    el.textContent = (dec ? v.toFixed(dec) : Math.round(v).toLocaleString()) + suf;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
});

// ---- scroll reveal
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .08 });
document.querySelectorAll("section").forEach(s => io.observe(s));

// ================= Interactivity =================


// ---- analyzer examples
const EX = [
  "Love this chip. Blazing fast performance, runs cool and quiet, and the drivers are stable. Great value for the money, highly recommend.",
  "Very frustrated. Buggy drivers and constant crashes, it runs hot and the thermal throttling is a problem. Overpriced and not recommended.",
  "Performance is great and easy to install, but it runs hot and the power draw is insane. Not stable after the latest bios update.",
];
document.querySelectorAll("[data-ex]").forEach(b => b.onclick = () => {
  $("tryInput").value = EX[b.dataset.ex]; $("tryInput").dispatchEvent(new Event("input"));
});

// ---- product detail modal (event delegation: cards are re-rendered on filter)
function showProduct(name) {
  const p = D.products.find(x => x.name === name); if (!p) return;
  const asp = (D.aspects[p.category] || []).slice(0, 4);
  const revs = D.reviews.filter(r => r.product === name).slice(0, 4);
  $("modalBody").innerHTML = `<div class="mhead"><div class="ring" style="--p:${p.positive};--n:${p.negative}"><i>${Math.round(p.positive)}%</i></div>
    <div><span class="cat pcard-cat" style="font-size:11px;padding:1px 8px;border-radius:999px;background:rgba(139,92,246,.2);color:#c9b6ff">${p.category}</span><h3>${p.name}</h3></div></div>
    <div class="mstats"><div class="tile"><b class="pos">${p.positive}%</b><span>positive</span></div><div class="tile"><b class="neg">${p.negative}%</b><span>negative</span></div><div class="tile"><b>${p.count.toLocaleString()}</b><span>reviews · ${p.avgRating}★</span></div></div>
    <h3>Sentiment over time</h3><canvas id="modalChart" height="90"></canvas>
    <h3 style="margin-top:16px">Biggest pain points in ${p.category}</h3>
    ${asp.map(x => `<div class="mrev"><b>${x.aspect}</b> <span class="neg">${x.negShare}% negative</span> · ${x.total.toLocaleString()} mentions</div>`).join("")}
    <h3 style="margin-top:16px">Recent reviews</h3>
    ${revs.map(r => `<div class="mrev"><span class="badge ${r.label}">${r.label}</span> <small>${r.date} · ${r.source}</small><br>${esc(r.text)}</div>`).join("") || '<p class="note">No reviews for this product.</p>'}
    <p style="margin-top:14px"><button class="chip" id="cmpFromModal">Compare with another product →</button></p>`;
  $("modal").hidden = false;
  draw("modalChart", { type: "line", plugins: [glow, crosshair], data: { labels: D.quarters, datasets: [{ data: D.trendProducts[name], borderColor: "#4cc9ff", backgroundColor: areaFill("#4cc9ff"), fill: true, tension: .4, borderWidth: 3, pointRadius: 0, pointHoverRadius: 6, spanGaps: true }] },
    options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { maxTicksLimit: 8 } } } } });
  $("cmpFromModal").onclick = () => { closeModal(); $("cmpA").value = name; renderCompare(); $("compare").scrollIntoView({ behavior: "smooth" }); };
}
const closeModal = () => { $("modal").hidden = true; };
document.addEventListener("click", e => {
  const c = e.target.closest(".pcard[data-name]");
  if (c) showProduct(c.dataset.name);
  if (e.target === $("modal") || e.target.id === "modalX") closeModal();
});
// tag product cards with their name after each render
new MutationObserver(() => document.querySelectorAll("#productCards .pcard:not([data-name])").forEach(el => el.dataset.name = el.querySelector("b").textContent))
  .observe($("productCards"), { childList: true });
document.querySelectorAll("#productCards .pcard").forEach(el => el.dataset.name = el.querySelector("b").textContent);

// ---- compare
const COMP = window.COMPETITORS || [];
const findP = n => D.products.find(p => p.name === n) || COMP.find(p => p.name === n);
const opts = `<optgroup label="Intel">${D.products.map(p => `<option>${p.name}</option>`).join("")}</optgroup>` +
  (COMP.length ? `<optgroup label="Competitors (real Amazon reviews)">${COMP.map(p => `<option>${p.name}</option>`).join("")}</optgroup>` : "");
$("cmpA").innerHTML = opts; $("cmpB").innerHTML = opts;
$("cmpA").value = D.products[0].name; $("cmpB").value = D.products[Math.min(4, D.products.length - 1)].name;
function scores(p) {
  const t = (D.trendProducts[p.name] || []).filter(x => x != null), r = t.slice(-4), net = p.trend != null ? p.trend : r.length ? r.reduce((s, x) => s + x, 0) / r.length : 0;
  const maxC = Math.max(...D.products.concat(COMP).map(x => x.count));
  return [p.positive, 100 - p.negative, p.avgRating * 20, (net + 100) / 2, p.count / maxC * 100].map(v => Math.round(v));
}
const AX = ["Positive %", "Low negative %", "Avg rating", "Recent trend", "Review volume"];
function renderCompare() {
  const A = findP($("cmpA").value), B = findP($("cmpB").value);
  const sa = scores(A), sb = scores(B);
  draw("cmpChart", { type: "radar", plugins: [glow], data: { labels: AX, datasets: [
    { label: A.name, data: sa, borderColor: "#4cc9ff", backgroundColor: "#4cc9ff40", pointBackgroundColor: "#4cc9ff", borderWidth: 3, pointRadius: 4, pointHoverRadius: 7 },
    { label: B.name, data: sb, borderColor: "#ff9f43", backgroundColor: "#ff9f4340", pointBackgroundColor: "#ff9f43", borderWidth: 3, pointRadius: 4, pointHoverRadius: 7 }] },
    options: { scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: "rgba(140,160,220,.18)" }, angleLines: { color: "rgba(140,160,220,.18)" }, pointLabels: { color: css("--ink") } } } } });
  const wins = sa.map((v, i) => v === sb[i] ? 0 : v > sb[i] ? 1 : -1), a = wins.filter(x => x > 0).length, b = wins.filter(x => x < 0).length;
  const lead = a === b ? "Too close to call" : `${a > b ? A.name : B.name} comes out ahead`;
  $("cmpVerdict").innerHTML = `<h3>${lead}</h3><p class="note">${A.name} leads on ${a} of 5 measures; ${B.name} on ${b}.</p>
    <table><tr><th></th><th>${A.name}</th><th>${B.name}</th></tr>${AX.map((n, i) => `<tr><td>${n}</td><td class="${wins[i] > 0 ? "pos" : ""}">${sa[i]}</td><td class="${wins[i] < 0 ? "pos" : ""}">${sb[i]}</td></tr>`).join("")}</table>${(A.limited || B.limited) ? `<p class="note">${[A, B].filter(x => x.limited).map(x => x.name).join(" and ")} ${A.limited && B.limited ? "have" : "has"} fewer than ${D.meta.minFull || 30} reviews, so treat this as indicative.</p>` : ""}${A.category !== B.category ? '<p class="note">These products are in different categories, so the comparison is only indicative.</p>' : ""}`;
}
["cmpA", "cmpB"].forEach(id => $(id).addEventListener("input", renderCompare));
$("cmpSwap").onclick = () => { const t = $("cmpA").value; $("cmpA").value = $("cmpB").value; $("cmpB").value = t; renderCompare(); };
renderCompare();

// ---- presentation mode
let slides = [], cur = 0;
function showSlide(i) {
  cur = (i + slides.length) % slides.length;
  slides.forEach((s, j) => s.classList.toggle("active", j === cur));
  document.querySelectorAll("#pDots i").forEach((d, j) => d.classList.toggle("on", j === cur));
  window.scrollTo(0, 0);
  Object.values(charts).forEach(c => c.resize && c.resize());
}
function startPresent() {
  slides = [...document.querySelectorAll("main > section")].filter(s => !s.hidden);
  document.body.classList.add("present"); $("pbar").hidden = false;
  $("pDots").innerHTML = slides.map((_, i) => `<i title="${i + 1}"></i>`).join("");
  document.querySelectorAll("#pDots i").forEach((d, i) => d.onclick = () => showSlide(i));
  slides.forEach(s => s.classList.add("in"));
  showSlide(0);
  if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
}
function endPresent() {
  document.body.classList.remove("present"); $("pbar").hidden = true;
  slides.forEach(s => s.classList.remove("active"));
  if (document.fullscreenElement) document.exitFullscreen();
}
$("presentBtn").onclick = startPresent; $("pExit").onclick = endPresent;
$("pNext").onclick = () => showSlide(cur + 1); $("pPrev").onclick = () => showSlide(cur - 1);
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeModal(); }
  if (!document.body.classList.contains("present") || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); showSlide(cur + 1); }
  if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); showSlide(cur - 1); }
  if (e.key === "Escape") endPresent();
});
