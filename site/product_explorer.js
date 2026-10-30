// "Product reviews" section: pick a product -> image, what it is, features, reviews.
(function () {
  const D = window.DATA, INFO = window.PRODUCT_INFO || {};
  const g = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const box = g("pvSearch"); if (!box) return;
  const sel = { value: D.products[0].name };
  function results() {
    const q = box.value.trim().toLowerCase();
    const m = D.products.filter(p => !q || (p.name + " " + p.category).toLowerCase().includes(q));
    g("pvResults").innerHTML = m.map(p => `<button class="chip" data-n="${esc(p.name)}" aria-pressed="${p.name === sel.value}">${esc(p.name)}</button>`).join("");
    g("pvEmpty").hidden = m.length > 0; g("pvDetail").hidden = m.length === 0;
    if (m.length && !m.some(p => p.name === sel.value)) { sel.value = m[0].name; render(); }
    else g("pvResults").querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.n === sel.value));
  }
  box.oninput = results;
  g("pvResults").onclick = e => { const b = e.target.closest("[data-n]"); if (b) { sel.value = b.dataset.n; render(); results(); } };
  let sent = "";
  g("pvSent").innerHTML = ["", "positive", "neutral", "negative", "mixed"].map(s => `<button class="chip${s === sent ? " on" : ""}" data-s="${s}">${s || "All"}</button>`).join("");

  function render() {
    const p = D.products.find(x => x.name === sel.value), info = INFO[p.name] || { tag: p.category, desc: "No description available.", features: [] };
    g("pvImg").innerHTML = (window.productPhoto && window.productPhoto(p.name)) || window.productImage(p.name, p.category);
    g("pvInfo").innerHTML = `<span class="pcard-cat">${esc(p.category)}</span><h3 style="font-size:22px;margin:6px 0 2px">${esc(p.name)}</h3>
      <p class="note" style="margin:0 0 8px">${esc(info.tag)}</p><p>${esc(info.desc)}</p>${p.limited ? `<p class="note neg">Limited data: only ${p.count} Amazon reviews, so the numbers below are indicative.</p>` : ""}
      <h3>Key functionalities</h3><ul class="pv-feat">${info.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul>
      <div class="mstats"><div class="tile"><b class="pos">${p.positive}%</b><span>positive</span></div><div class="tile"><b class="neg">${p.negative}%</b><span>negative</span></div><div class="tile"><b>${p.avgRating}★</b><span>${p.count.toLocaleString()} reviews</span></div></div>`;
    const revs = (window.getUserReviews ? window.getUserReviews(p.name) : []).concat(D.reviews.filter(r => r.product === p.name)).filter(r => !sent || r.label === sent);
    g("pvCount").textContent = `${revs.length} Amazon review${revs.length === 1 ? "" : "s"} shown${sent ? " (" + sent + ")" : ""}, most helpful first. ${p.count.toLocaleString()} reviews analysed for this product.`;
    g("pvReviews").innerHTML = revs.slice(0, 30).map(r => `<div class="mrev"><span class="badge ${r.label}">${r.label}</span> <small>${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)} · ${r.date} · ${esc(r.source)}${r.user ? " (your review)" : ""}</small><br>${esc(r.text)}</div>`).join("") || '<p class="note">No reviews match.</p>';
  }
  g("pvSent").onclick = e => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    sent = b.dataset.s; g("pvSent").querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c === b)); render();
  };
  // let product cards / modal jump here
  window.showProductReviews = name => {
    sent = ""; g("pvSent").querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c.dataset.s === ""));
    box.value = name; sel.value = name; results(); render(); g("pv").scrollIntoView({ behavior: "smooth" });
  };
  results(); render();
})();
