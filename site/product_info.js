// Product catalogue: what each product is and what it does. Keyed by product name in data.js.
window.PRODUCT_INFO = {
  "Core i9-13900K": { tag: "Flagship 13th Gen desktop CPU", desc: "A 24-core (8 performance + 16 efficient) unlocked desktop processor for enthusiast gaming, content creation and heavy multitasking.", features: ["Up to 5.8 GHz max turbo", "24 cores / 32 threads", "Unlocked for overclocking", "DDR4 and DDR5 support", "Integrated UHD 770 graphics"] },
  "Core i7-12700K": { tag: "12th Gen hybrid performance CPU", desc: "A 12-core hybrid desktop CPU that introduced Intel's performance + efficient core design to mainstream gaming and creator PCs.", features: ["12 cores / 20 threads", "Up to 5.0 GHz turbo", "Unlocked multiplier", "PCIe 5.0 and DDR5 support", "Integrated UHD 770 graphics"] },
  "Core i5-13600K": { tag: "Mid-range gaming CPU", desc: "A 14-core unlocked desktop processor that balances price and performance for gaming and everyday productivity.", features: ["14 cores / 20 threads", "Up to 5.1 GHz turbo", "Unlocked for overclocking", "DDR4 and DDR5 support", "Strong value for gaming"] },
  "Core Ultra 7 155H": { tag: "Meteor Lake mobile CPU with AI engine", desc: "A 16-core laptop processor with a built-in NPU, integrated Arc graphics and a tiled chiplet design for thin-and-light laptops.", features: ["16 cores / 22 threads", "Dedicated NPU for on-device AI", "Integrated Arc graphics", "Up to 4.8 GHz turbo", "Better battery efficiency"] },
  "Arc A770": { tag: "First-generation Arc desktop GPU", desc: "A 1440p-class discrete graphics card with up to 16 GB of VRAM, Intel's first major entry in the gaming GPU market.", features: ["16 GB GDDR6 option", "Ray tracing hardware", "XeSS AI upscaling", "AV1 hardware encode", "DirectX 12 Ultimate"] },
  "Arc B580": { tag: "Second-generation Battlemage GPU", desc: "A value-focused 1440p graphics card built on the Xe2 architecture, with better drivers and efficiency than the first Arc generation.", features: ["12 GB GDDR6", "Xe2 'Battlemage' architecture", "XeSS 2 with frame generation", "Improved ray tracing", "AV1 hardware encode"] },
  "SSD 670p": { tag: "QLC NVMe solid-state drive", desc: "An M.2 NVMe SSD aimed at affordable, high-capacity storage for everyday PCs and laptops.", features: ["PCIe 3.0 x4 NVMe", "Up to 2 TB capacity", "Up to ~3,500 MB/s reads", "QLC 3D NAND", "Low power for laptops"] },
  "Wi-Fi 6E AX211": { tag: "Wi-Fi 6E + Bluetooth 5.3 adapter", desc: "An M.2 wireless card that adds the 6 GHz band for faster, less congested wireless connections on laptops and desktops.", features: ["Wi-Fi 6E (6 GHz band)", "Up to 2.4 Gbps", "Bluetooth 5.3", "160 MHz channels", "M.2 CNVio2 form factor"] },
  "Core i7-13700K": { tag: "High-end 13th Gen gaming CPU", desc: "A 16-core unlocked desktop processor that sits between the i5 and i9, aimed at gaming and streaming.", features: ["16 cores / 24 threads", "Up to 5.4 GHz turbo", "Unlocked for overclocking", "DDR4 and DDR5 support", "Integrated UHD 770 graphics"] },
  "Core i9-12900K": { tag: "12th Gen flagship CPU", desc: "The 16-core flagship of Intel's first hybrid-architecture desktop generation, for gaming and heavy creative work.", features: ["16 cores / 24 threads", "Up to 5.2 GHz turbo", "Unlocked multiplier", "PCIe 5.0 and DDR5 support", "Integrated UHD 770 graphics"] },
  "Core i5-12400F": { tag: "Budget gaming CPU", desc: "A 6-core desktop processor without integrated graphics, popular for affordable gaming builds with a separate graphics card.", features: ["6 cores / 12 threads", "Up to 4.4 GHz turbo", "Low power draw", "Includes stock cooler", "Requires a discrete GPU"] },
  "Core Ultra 9 285K": { tag: "Arrow Lake flagship desktop CPU", desc: "A 24-core desktop processor from the Core Ultra 200S generation, built for efficiency and AI with a built-in NPU.", features: ["24 cores (8P + 16E)", "Up to 5.7 GHz turbo", "Built-in NPU for AI", "DDR5 only", "New LGA1851 socket"] },
  "Arc A750": { tag: "First-generation Arc mid-range GPU", desc: "A 1080p/1440p graphics card from the first Arc generation, offering ray tracing and XeSS at a lower price than the A770.", features: ["8 GB GDDR6", "Ray tracing hardware", "XeSS AI upscaling", "AV1 hardware encode", "DirectX 12 Ultimate"] },
  "Arc B570": { tag: "Second-generation Battlemage entry GPU", desc: "A budget 1080p-class graphics card built on the Xe2 architecture, a step down from the Arc B580.", features: ["10 GB GDDR6", "Xe2 'Battlemage' architecture", "XeSS 2 with frame generation", "Improved ray tracing", "AV1 hardware encode"] },
  "SSD 660p": { tag: "Early QLC NVMe SSD", desc: "Intel's first consumer QLC NVMe drive, offering large capacities at a low price for everyday storage.", features: ["PCIe 3.0 x4 NVMe", "Up to 2 TB capacity", "QLC 3D NAND", "Low idle power", "Budget price per GB"] },
  "Optane SSD 905P": { tag: "High-endurance Optane SSD", desc: "A premium SSD using 3D XPoint memory, known for very low latency and high endurance for workstations and enthusiasts.", features: ["3D XPoint (Optane) memory", "Very low latency", "Very high endurance", "PCIe 3.0 x4", "Consistent performance under load"] },
  "Wi-Fi 7 BE200": { tag: "Wi-Fi 7 + Bluetooth 5.4 adapter", desc: "An M.2 wireless card supporting Wi-Fi 7 for higher speeds and lower latency than Wi-Fi 6E.", features: ["Wi-Fi 7 (802.11be)", "Up to 5.8 Gbps", "Bluetooth 5.4", "320 MHz channels", "Multi-Link Operation"] },
  "Ethernet I226-V": { tag: "2.5 GbE controller (I225 successor)", desc: "An updated 2.5 Gigabit Ethernet controller found on many motherboards, fixing issues reported with the I225-V.", features: ["2.5 Gbps / 1 Gbps / 100 Mbps", "Improved stability over I225-V", "PCIe interface", "Energy Efficient Ethernet", "Built into many motherboards"] },
  "Ethernet I225-V": { tag: "2.5 GbE network controller", desc: "A 2.5 Gigabit Ethernet controller found on many motherboards, offering faster wired networking than standard gigabit.", features: ["2.5 Gbps / 1 Gbps / 100 Mbps", "Backward compatible with gigabit", "PCIe interface", "Energy Efficient Ethernet", "Built into many motherboards"] },
};

// Inline SVG illustration per category, so no external images are needed.
window.productImage = function (name, cat) {
  const label = name.replace(/&/g, "&amp;");
  const art = {
    CPU: `<rect x="95" y="45" width="130" height="130" rx="10" fill="#0b2a55" stroke="#4cc9ff" stroke-width="3"/><rect x="120" y="70" width="80" height="80" rx="6" fill="#0068b5"/><text x="160" y="118" text-anchor="middle" fill="#fff" font-size="22" font-weight="700" font-family="sans-serif">intel</text>${[...Array(8)].map((_, i) => `<path d="M${110 + i * 14} 45v-15M${110 + i * 14} 175v15" stroke="#9aa8c7" stroke-width="3"/>`).join("")}${[...Array(8)].map((_, i) => `<path d="M95 ${60 + i * 14}h-15M225 ${60 + i * 14}h15" stroke="#9aa8c7" stroke-width="3"/>`).join("")}`,
    GPU: `<rect x="30" y="65" width="260" height="100" rx="12" fill="#0b2a55" stroke="#4cc9ff" stroke-width="3"/><circle cx="105" cy="115" r="38" fill="#08162f" stroke="#8b5cf6" stroke-width="3"/><circle cx="215" cy="115" r="38" fill="#08162f" stroke="#8b5cf6" stroke-width="3"/>${[105, 215].map(x => `<path d="M${x} 115l0-30M${x} 115l26 15M${x} 115l-26 15" stroke="#4cc9ff" stroke-width="5" stroke-linecap="round"/>`).join("")}<rect x="50" y="165" width="150" height="14" fill="#c9a24a"/>`,
    Storage: `<rect x="40" y="75" width="240" height="90" rx="8" fill="#0b2a55" stroke="#4cc9ff" stroke-width="3"/><rect x="60" y="92" width="60" height="56" rx="4" fill="#08162f" stroke="#8b5cf6" stroke-width="2"/><rect x="132" y="92" width="60" height="56" rx="4" fill="#08162f" stroke="#8b5cf6" stroke-width="2"/><rect x="204" y="92" width="60" height="56" rx="4" fill="#0068b5"/><rect x="40" y="165" width="70" height="12" fill="#c9a24a"/>`,
    Networking: `<rect x="60" y="110" width="200" height="60" rx="8" fill="#0b2a55" stroke="#4cc9ff" stroke-width="3"/><rect x="80" y="128" width="40" height="24" rx="3" fill="#0068b5"/><circle cx="160" cy="140" r="4" fill="#2ee6a6"/><circle cx="180" cy="140" r="4" fill="#2ee6a6"/><path d="M110 90a70 70 0 0 1 100 0M128 72a45 45 0 0 1 64 0M146 54a20 20 0 0 1 28 0" fill="none" stroke="#4cc9ff" stroke-width="4" stroke-linecap="round"/>`,
  }[cat] || "";
  return `<svg viewBox="0 0 320 200" role="img" aria-label="${label}"><defs><radialGradient id="pg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#16305f"/><stop offset="1" stop-color="#070b16"/></radialGradient></defs><rect width="320" height="200" rx="14" fill="url(#pg)"/>${art}</svg>`;
};

// Real photos from Wikimedia Commons (credits in img/credits.json). Products without one fall back to the drawn illustration.
window.PRODUCT_PHOTOS = {
 "Core i9-13900K": {
  "src": "img/core-i9-13900k-box.jpg",
  "credit": "",
  "license": "",
  "page": "",
  "rep": false
 },
 "Core i7-12700K": {
  "src": "img/core-i7-12700k.jpg",
  "credit": "4300streetcar",
  "license": "CC BY 4.0",
  "page": "https://commons.wikimedia.org/wiki/File:Intel_Core_i7_12700K.jpg",
  "rep": false
 },
 "Core i5-13600K": {
  "src": "img/core-i5-13600k.jpg",
  "credit": "4300streetcar",
  "license": "CC BY 4.0",
  "page": "https://commons.wikimedia.org/wiki/File:Intel_Core_i5_13600K.jpg",
  "rep": false
 },
 "Core i7-13700K": {
  "src": "img/core-i7-13700k.jpg",
  "credit": "4300streetcar",
  "license": "CC BY 4.0",
  "page": "https://commons.wikimedia.org/wiki/File:Intel_Core_i7_13700K.jpg",
  "rep": false
 },
 "Arc A770": {
  "src": "img/arc-a770.jpg",
  "credit": "Telaneo",
  "license": "CC0",
  "page": "https://commons.wikimedia.org/wiki/File:Intel_Arc_A770_front.jpg",
  "rep": false
 },
 "Arc B580": {
  "src": "img/arc-b580-official.jpg",
  "credit": "",
  "license": "",
  "page": "",
  "rep": false
 },
 "Wi-Fi 6E AX211": {
  "src": "img/wifi-ax211.jpg",
  "credit": "",
  "license": "",
  "page": "",
  "rep": false
 },
 "Wi-Fi 7 BE200": {
  "src": "img/wifi-be200.jpg",
  "credit": "",
  "license": "",
  "page": "",
  "rep": false
 },
 "Ethernet I225-V": {
  "src": "img/ethernet-i225v.jpg",
  "credit": "",
  "license": "",
  "page": "",
  "rep": false
 },
 "Ethernet I226-V": {
  "src": "img/ethernet-i226v.jpg",
  "credit": "",
  "license": "",
  "page": "",
  "rep": false
 },
 "SSD 670p": {
  "credit": "\u30ac\u30e9\u30d1\u30ea",
  "license": "CC BY-SA 4.0",
  "page": "https://commons.wikimedia.org/wiki/File:M2_SATA_M2_NVMe_compare.png",
  "src": "img/intel-m2-ssd.jpg",
  "rep": true
 },
 "SSD 660p": {
  "credit": "\u30ac\u30e9\u30d1\u30ea",
  "license": "CC BY-SA 4.0",
  "page": "https://commons.wikimedia.org/wiki/File:M2_SATA_M2_NVMe_compare.png",
  "src": "img/intel-m2-ssd.jpg",
  "rep": true
 },
 "Optane SSD 905P": {
  "src": "img/optane-905p.jpg",
  "credit": "",
  "license": "",
  "page": "",
  "rep": false
 },
 "Arc A750": {
  "src": "img/arc-a750.jpg",
  "credit": "",
  "license": "",
  "page": "",
  "rep": false
 },
 "Arc B570": {
  "src": "img/arc-b570.jpg",
  "credit": "",
  "license": "",
  "page": "",
  "rep": false
 },
 "Core i9-12900K": {
  "src": "img/core-i9-12900k.jpg",
  "credit": "",
  "license": "",
  "page": "",
  "rep": false
 },
 "Core i5-12400F": {
  "src": "img/core-i5-12400f.jpg",
  "credit": "",
  "license": "",
  "page": "",
  "rep": false
 },
 "Core Ultra 7 155H": {
  "src": "img/core-ultra-7-155h.jpg",
  "credit": "",
  "license": "",
  "page": "",
  "rep": false
 },
 "Core Ultra 9 285K": {
  "src": "img/core-ultra-9-285k.jpg",
  "credit": "",
  "license": "",
  "page": "",
  "rep": false
 }
};
window.productPhoto = function (name) {
  const p = window.PRODUCT_PHOTOS[name]; if (!p) return null;
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  return `<figure class="pv-photo"><img src="${p.src}" alt="${esc(name)}" loading="lazy"${p.pos ? ` style="object-position:${p.pos}"` : ""}>${p.credit || p.rep ? `<figcaption>${p.rep ? "Representative image of a similar product. " : ""}${p.credit ? `Photo: ${esc(p.credit)} · <a href="${esc(p.page)}" target="_blank" rel="noopener">${esc(p.license)}</a>, via Wikimedia Commons` : ""}</figcaption>` : ""}</figure>`;
};
