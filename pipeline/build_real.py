"""Build site/data.js and site/competitors.js from the real Amazon review CSVs in data/raw/.

Reads amazon_{intel,amd,nvidia}_reviews.csv (Amazon Reviews 2023 export). A review is assigned to a
dashboard product when its Amazon listing title names that model AND looks like the component itself
(not a laptop / prebuilt PC / bundle that merely contains it). Labels come from star ratings.

Run:  python3 pipeline/build_real.py
Standard library only.
"""
import csv
import html
import json
import random
import re
from collections import Counter, defaultdict
from pathlib import Path

random.seed(11)
csv.field_size_limit(10 ** 9)
ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
SITE = ROOT / "site"

MIN_FULL = 30      # reviews needed to be reported without a warning
MIN_SHOWN = 10     # below this a product is dropped
SAMPLE_PER_PRODUCT = 40
FIRST_QUARTER_YEAR = 2015

# listing looks like a whole system / accessory rather than the part itself
SYSTEM = re.compile(r"laptop|notebook|desktop (?!processor|cpu)|\bpcs?\b|computer|workstation|gaming system|prebuilt|pre-built|"
                    r"bundle|all-in-one|chromebook|tower|combo|\bkit\b|motherboard|monitor", re.I)

# name, brand file, category, regex on the Amazon listing title
SKUS = [
    ("Core i9-13900K", "Intel", "CPU", r"13900kf?(?!s)"), ("Core i7-12700K", "Intel", "CPU", r"12700kf?"),
    ("Core i5-13600K", "Intel", "CPU", r"13600kf?"), ("Core i7-13700K", "Intel", "CPU", r"13700kf?"),
    ("Core i9-12900K", "Intel", "CPU", r"12900kf?(?!s)"), ("Core i5-12400F", "Intel", "CPU", r"12400f?\b"),
    ("Core Ultra 7 155H", "Intel", "CPU", r"ultra 7 155h"), ("Core Ultra 9 285K", "Intel", "CPU", r"285k"),
    ("Arc A770", "Intel", "GPU", r"a770"), ("Arc A750", "Intel", "GPU", r"a750"),
    ("Arc B580", "Intel", "GPU", r"b580"), ("Arc B570", "Intel", "GPU", r"b570"),
    ("SSD 670p", "Intel", "Storage", r"670p"), ("SSD 660p", "Intel", "Storage", r"660p"),
    ("Optane SSD 905P", "Intel", "Storage", r"905p"),
    ("Wi-Fi 6E AX211", "Intel", "Networking", r"ax211"), ("Wi-Fi 7 BE200", "Intel", "Networking", r"be200"),
    ("Ethernet I225-V", "Intel", "Networking", r"i225"), ("Ethernet I226-V", "Intel", "Networking", r"i226"),
    ("AMD Ryzen 7 7800X3D", "AMD", "CPU", r"7800x3d"), ("AMD Ryzen 5 7600X", "AMD", "CPU", r"7600x"),
    ("AMD Ryzen 9 7950X", "AMD", "CPU", r"7950x"), ("AMD Ryzen 7 5800X", "AMD", "CPU", r"5800x(?!3d)"),
    ("AMD Ryzen 7 8840HS", "AMD", "CPU", r"8840hs"),
    ("AMD Radeon RX 7600", "AMD", "GPU", r"rx ?7600(?! ?xt)"), ("AMD Radeon RX 7700 XT", "AMD", "GPU", r"7700 ?xt"),
    ("NVIDIA GeForce RTX 4060", "NVIDIA", "GPU", r"4060(?! ?ti)"), ("NVIDIA GeForce RTX 4060 Ti", "NVIDIA", "GPU", r"4060 ?ti"),
    ("NVIDIA GeForce RTX 4070", "NVIDIA", "GPU", r"rtx ?4070(?! ?(ti|super))"),
]
SKUS = [(n, b, c, re.compile(p, re.I)) for n, b, c, p in SKUS]
FILES = {"Intel": "amazon_intel_reviews.csv", "AMD": "amazon_amd_reviews.csv", "NVIDIA": "amazon_nvidia_reviews.csv"}
CATS = ["CPU", "GPU", "Storage", "Networking"]

# aspect -> regex over review text
ASPECTS = {
    "Performance": r"performance|\bfast\b|\bslow\b|speed|benchmark|\bfps\b|\blag|snappy|powerful|boot",
    "Thermals": r"\bhot\b|heat|temp|cool|\bfan\b|thermal|overheat|throttl",
    "Power": r"power|battery|\bwatt|\bpsu\b|efficien",
    "Price / Value": r"price|value|worth|expensive|cheap|overpriced|\bmoney\b|\bcost|afford",
    "Drivers / Software": r"driver|software|firmware|\bbios\b|update|install|utility",
    "Compatibility": r"compatib|motherboard|\bsocket\b|\bfit\b|work(s|ed)? with|linux|windows|\bmac\b",
    "Reliability": r"crash|\bfail|\bdied\b|\bdead\b|broke|stable|reliab|defect|\bbsod\b|\breplace|\berrors?\b|\bfault",
    "Connectivity / Speed": r"wi-?fi|signal|connection|\brange\b|ethernet|disconnect|dropout|latency|throughput|\bread\b|\bwrite\b",
}
ASPECT_CATS = {"Performance": set(CATS), "Thermals": {"CPU", "GPU", "Storage"}, "Power": {"CPU", "GPU"},
               "Price / Value": set(CATS), "Drivers / Software": set(CATS), "Compatibility": set(CATS),
               "Reliability": set(CATS), "Connectivity / Speed": {"Networking", "Storage"}}
ASPECTS = {a: re.compile(p, re.I) for a, p in ASPECTS.items()}

STOP = set("""a an and are as at be but by for from has have i if in is it its my of on or so that the this to was were with
you your not no too very just than then them they their there what when which who will would can could one get got after
all about out up me we our into only also still even more most some any over under much amazon product item bought buy
purchased purchase use used using work works worked like really""".split())
POS_WORDS = """love loved great excellent fast blazing powerful snappy boost affordable worth value stable solid reliable
efficient polished easy cool quiet perfectly smooth recommend recommended impressed happy best improving improved good amazing
awesome plug flawless fantastic nice perfect superb satisfied pleased fine wonderful beautiful quick faster""".split()
NEG_WORDS = """disappointing disappointed buggy crashes crash unstable hot throttling overpriced expensive insane loud slow poor
stuttering fail failed broke broken unusable regret avoid frustrated frustrating problem problems hassle drops disconnects
dropouts degradation spike spikes latency blue worse terrible awful issues issue dead died waste junk defective faulty
horrible useless refund returned return bad slower noisy lag laggy unreliable overheats overheating""".split()
NEGATORS = {"not", "no", "never", "without", "isnt", "dont", "doesnt", "wasnt", "didnt", "cant"}


def clean(s):
    s = html.unescape(re.sub(r"<br\s*/?>", " ", s or ""))
    return re.sub(r"\s+", " ", s).strip()


def tokenize(text):
    return re.findall(r"[a-z0-9']+", text.lower().replace("'", ""))


def label_from_rating(r):
    return "positive" if r >= 4 else "negative" if r <= 2 else "neutral"


def lexicon_predict(tokens):
    score = 0
    for i, t in enumerate(tokens):
        s = 1 if t in POS_WORDS else -1 if t in NEG_WORDS else 0
        if s and i > 0 and tokens[i - 1] in NEGATORS:
            s = -s
        score += s
    return "positive" if score >= 1 else "negative" if score <= -1 else "neutral"


def quarter(date):
    y, m = int(date[:4]), int(date[5:7])
    return f"{y} Q{(m - 1) // 3 + 1}"


def pct(n, d):
    return round(100 * n / d, 1) if d else 0


def load():
    seen, rows, stats = set(), [], Counter()
    for brand, fname in FILES.items():
        for r in csv.DictReader(open(RAW / fname, encoding="utf-8", errors="replace")):
            stats["read"] += 1
            title = r["product"]
            sku = next((s for s in SKUS if s[1] == brand and s[3].search(title)), None)
            if not sku:
                continue
            stats["title match"] += 1
            if SYSTEM.search(title):
                stats["skipped: whole system/bundle"] += 1
                continue
            text = clean((r["review_title"] + ". " if r["review_title"] else "") + r["review"])
            try:
                rating, date = int(float(r["rating"])), r["date"][:10]
            except ValueError:
                continue
            if len(text) < 10 or not (1 <= rating <= 5) or len(date) != 10:
                stats["skipped: empty/invalid"] += 1
                continue
            key = (r["parent_asin"], text[:100], date)
            if key in seen:
                stats["skipped: duplicate"] += 1
                continue
            seen.add(key)
            try:
                helpful = int(float(r["helpful_votes"] or 0))
            except ValueError:
                helpful = 0
            rows.append({"product": sku[0], "brand": sku[1], "category": sku[2], "source": "Amazon", "date": date,
                         "rating": rating, "text": text, "helpful": helpful, "verified": r["verified_purchase"] == "True"})
    stats["kept"] = len(rows)
    return rows, stats


def main():
    rows, stats = load()
    for r in rows:
        r["tokens"] = tokenize(r["text"])
        r["label"] = label_from_rating(r["rating"])
        r["pred"] = lexicon_predict(r["tokens"])

    counts = Counter(r["product"] for r in rows)
    keep = {n for n, c in counts.items() if c >= MIN_SHOWN}
    rows = [r for r in rows if r["product"] in keep]
    intel = [r for r in rows if r["brand"] == "Intel"]
    order = [s for s in SKUS if s[0] in keep]
    intel_skus = [s for s in order if s[1] == "Intel"]

    classes = ["positive", "neutral", "negative"]
    cm = {a: {b: 0 for b in classes} for a in classes}
    for r in intel:
        cm[r["label"]][r["pred"]] += 1
    per_class = {}
    for c in classes:
        tp = cm[c][c]
        fp = sum(cm[o][c] for o in classes if o != c)
        fn = sum(cm[c][o] for o in classes if o != c)
        pr = tp / (tp + fp) if tp + fp else 0
        rc = tp / (tp + fn) if tp + fn else 0
        per_class[c] = {"precision": round(pr, 3), "recall": round(rc, 3),
                        "f1": round(2 * pr * rc / (pr + rc), 3) if pr + rc else 0, "support": sum(cm[c].values())}
    acc = sum(cm[c][c] for c in classes) / len(intel)
    macro_f1 = sum(v["f1"] for v in per_class.values()) / 3

    def summary(rs):
        cnt = Counter(r["label"] for r in rs)
        return {"count": len(rs), "positive": pct(cnt["positive"], len(rs)), "neutral": pct(cnt["neutral"], len(rs)),
                "negative": pct(cnt["negative"], len(rs)), "avgRating": round(sum(r["rating"] for r in rs) / len(rs), 2),
                "limited": len(rs) < MIN_FULL}

    quarters = sorted({quarter(r["date"]) for r in rows if int(r["date"][:4]) >= FIRST_QUARTER_YEAR})

    def trend(fn):
        out = []
        for q in quarters:
            rs = [r for r in intel if quarter(r["date"]) == q and fn(r)]
            out.append(round(100 * (sum(r["label"] == "positive" for r in rs) - sum(r["label"] == "negative" for r in rs)) / len(rs), 1) if len(rs) >= 3 else None)
        return out

    products = [dict(id=re.sub(r"[^a-z0-9]+", "-", n.lower()).strip("-"), name=n, category=c, **summary([r for r in intel if r["product"] == n]))
                for n, b, c, _ in intel_skus]
    cat_present = [c for c in CATS if any(p["category"] == c for p in products)]
    trend_products = {p["name"]: trend(lambda r, n=p["name"]: r["product"] == n) for p in products}
    trend_categories = {c: trend(lambda r, c=c: r["category"] == c) for c in cat_present}

    aspects, keywords = {}, {}
    for cat in ["All"] + cat_present:
        d = defaultdict(Counter)
        for r in intel:
            if cat != "All" and r["category"] != cat:
                continue
            for a, rx in ASPECTS.items():
                if r["category"] in ASPECT_CATS[a] and rx.search(r["text"]):
                    d[a][r["label"]] += 1
        aspects[cat] = sorted(({"aspect": a, "positive": c["positive"], "neutral": c["neutral"], "negative": c["negative"],
                                "total": sum(c.values()), "negShare": pct(c["negative"], sum(c.values()))} for a, c in d.items()),
                              key=lambda x: -x["negShare"])
        keywords[cat] = {}
        for lab in ["positive", "negative"]:
            c = Counter()
            for r in intel:
                if r["label"] == lab and (cat == "All" or r["category"] == cat):
                    c.update(t for t in set(r["tokens"]) if t not in STOP and len(t) > 2 and not t.isdigit())
            keywords[cat][lab] = c.most_common(40)
    for cat in keywords:
        both = {w for w, _ in keywords[cat]["positive"][:15]} & {w for w, _ in keywords[cat]["negative"][:15]}
        for lab in keywords[cat]:
            keywords[cat][lab] = [kv for kv in keywords[cat][lab] if kv[0] not in both][:25]

    # sample shown in the explorer / product pages: most helpful, readable length, mix of sentiments
    sample = []
    for p in products:
        rs = sorted((r for r in intel if r["product"] == p["name"] and 30 <= len(r["text"]) <= 600), key=lambda r: (-r["helpful"], r["date"]))
        pos = [r for r in rs if r["label"] == "positive"][:SAMPLE_PER_PRODUCT // 2]
        rest = [r for r in rs if r["label"] != "positive"][:SAMPLE_PER_PRODUCT - len(pos)]
        sample += pos + rest
    sample = [{"product": r["product"], "category": r["category"], "source": "Amazon", "date": r["date"], "rating": r["rating"],
               "label": r["label"], "pred": r["pred"], "text": r["text"], "verified": r["verified"]} for r in sample]
    sample.sort(key=lambda r: r["date"], reverse=True)

    cat_counts = Counter(r["category"] for r in intel)
    data = {
        "meta": {"total": len(intel), "from": min(r["date"] for r in intel), "to": max(r["date"] for r in intel), "synthetic": False,
                 "sources": {"Amazon": len(intel)}, "categories": dict(cat_counts), "minFull": MIN_FULL,
                 "note": "Amazon Reviews 2023 export. Reviews are matched to a product by Amazon listing title; whole laptops/PCs/bundles are excluded."},
        "products": products, "quarters": quarters, "trendProducts": trend_products, "trendCategories": trend_categories,
        "aspects": aspects, "keywords": keywords,
        "metrics": {"model": "Lexicon + negation (rule-based baseline)", "accuracy": round(acc, 3), "macroF1": round(macro_f1, 3),
                    "perClass": per_class, "confusion": cm, "labels": classes, "n": len(intel)},
        "lexicon": {"pos": sorted(set(POS_WORDS)), "neg": sorted(set(NEG_WORDS)), "negators": sorted(NEGATORS)},
        "reviews": sample,
    }
    (SITE / "data.js").write_text("window.DATA = " + json.dumps(data, separators=(",", ":")) + ";\n")

    # competitors for the Compare section (real Amazon stats, same fields as products + brand + recent trend)
    comp = []
    for n, b, c, _ in order:
        if b == "Intel":
            continue
        rs = [r for r in rows if r["product"] == n]
        recent = sorted({quarter(r["date"]) for r in rs})[-4:]
        rr = [r for r in rs if quarter(r["date"]) in recent]
        net = round(100 * (sum(r["label"] == "positive" for r in rr) - sum(r["label"] == "negative" for r in rr)) / len(rr), 1)
        comp.append({"name": n, "brand": b, "category": c, "trend": net, **summary(rs)})
    (SITE / "competitors.js").write_text("// Generated by pipeline/build_real.py from real Amazon reviews. Do not edit by hand.\n"
                                         "window.COMPETITORS = " + json.dumps(comp, indent=1) + ";\n")

    random.shuffle(intel)
    cut = int(len(intel) * 0.8)
    for fname, rs in (("train.csv", intel[:cut]), ("test.csv", intel[cut:])):
        with open(SITE / fname, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["product", "category", "source", "date", "rating", "label", "text"])
            for r in rs:
                w.writerow([r["product"], r["category"], "Amazon", r["date"], r["rating"], r["label"], r["text"]])
    print(dict(stats))
    print(f"{len(intel)} Intel reviews | {len(products)} products | accuracy {acc:.3f} macro-F1 {macro_f1:.3f}")
    for p in products:
        print(f"  {p['name']:20s} {p['count']:5d} pos {p['positive']:5.1f}% neg {p['negative']:5.1f}% {'LIMITED' if p['limited'] else ''}")
    for c in comp:
        print(f"  [{c['brand']}] {c['name']:28s} {c['count']:4d} pos {c['positive']}% {'LIMITED' if c['limited'] else ''}")


if __name__ == "__main__":
    main()
