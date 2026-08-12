# Calibrate

Adaptive GRE/GMAT practice: timed sections on a real clock, spaced repetition, and error tagging that shows whether you are losing points to carelessness, concepts, or pace.

Built around the idea that at a high target score, **accuracy is not the metric — consistency under time is**.

## What it does

- **Full timed sections** — real section lengths on a real clock, with skip, flag, navigate, a review screen, and no feedback until you submit
- **Practice questions** across GRE Quant, GRE Verbal, GMAT Quant, GMAT Verbal, and GMAT Data Insights, each with a full explanation and a transferable takeaway
- **Flashcards** — GRE vocabulary, math facts, and verbal method cards
- **Method guides** with worked examples, plus "go deeper" notes explaining why each shortcut is true
- **Spaced repetition** — questions and cards share one Leitner scheduler
- **Error diagnosis** — you tag every miss (careless / misread / concept gap / rushed / guess), and the diagnostics show which category is actually costing you
- **Pace-gated mastery** — a correct answer delivered over the pacing target does not advance. Right-but-slow is treated as a failure, because it is one on test day
- **Score calibration** — a Rasch (1PL) ability estimate with a confidence interval that narrows as you answer

## Current test formats

Written to the formats in force as of 2026:

| GRE General Test | GMAT (Focus Edition) |
|---|---|
| 1h 58m · 55 questions | 2h 15m · 64 questions |
| Quant ×2: 12 + 15 (21 + 26 min) | Quant: 21 (45 min) — problem solving only |
| Verbal ×2: 12 + 15 (18 + 23 min) | Verbal: 23 (45 min) |
| Writing: 1 Analyze an Issue task | Data Insights: 20 (45 min) |
| 130–170 per section | 205–805 total |

The GMAT bank reflects the Focus Edition changes: **no geometry in Quant**, **no sentence correction**, and **data sufficiency counted under Data Insights** rather than Quant. Pacing targets are derived from the real section timings.

## Running it locally

Requires Node 18 or newer.

```bash
npm install
npm run dev
```

Then open the URL Vite prints, usually `http://localhost:5173`.

To build for production:

```bash
npm run build
npm run preview
```

## Deploying

**Vercel or Netlify** — import the repository; both auto-detect Vite. No configuration needed.

**GitHub Pages** — the included workflow at `.github/workflows/deploy.yml` builds and publishes on every push to `main`. Enable it under *Settings → Pages → Source: GitHub Actions*. If your repository is not named `calibrate`, update the `base` path in `vite.config.js` to match.

## Works offline

A service worker caches the whole app, so it opens with no connection — on a subway, on a plane. Because everything ships in one bundle, that covers questions, timed sections, guides, and flashcards, not just part of it.

Add it to your home screen and it launches like a native app. When a new version is deployed, a prompt appears rather than leaving you on a stale copy.

Offline support is active only in production builds. During `npm run dev` it stays off so a cached bundle never hides your edits.

## Accessibility

Built to WCAG 2.1 AA:

- All text meets 4.5:1 contrast; interactive borders meet 3:1
- Correct and incorrect are marked with symbols, not colour alone
- Full keyboard support, skip link, landmarks, and semantic headings
- ARIA states on every control; results announced via a live region
- Definitions open on click rather than hover, so they work on touch and satisfy WCAG 1.4.13
- Reflows at 400% zoom; supports reduced motion and Windows High Contrast
- Timed sections disclose the limit before you start and announce warnings at 10, 5, 2, and 1 minutes rather than reading the clock aloud continuously
- Low time is signalled with text, not colour alone; focus moves to each new question so keyboard and screen reader users are never stranded

## Data and privacy

Everything is stored locally in your browser via `localStorage`. There is no account, no server, and no analytics. Clearing site data resets your progress.

## About the questions

All questions, explanations, lessons, and flashcards are **original**, written to the published specifications for each question type — the same formats, answer conventions, and tested concepts. They are **not** reproductions of official test items.

This is a diagnostic and drilling tool, not a replacement for official material. For authentic retired questions and calibrated score prediction, use:

- **GRE** — ETS *Official Guide to the GRE General Test*, 4th Edition, and the free POWERPREP tests at [ets.org/gre](https://www.ets.org/gre)
- **GMAT** — GMAC *Official Guide* and the starter kit at [mba.com](https://www.mba.com)

## Licence

MIT — see [LICENSE](LICENSE).
