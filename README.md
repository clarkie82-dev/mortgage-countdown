# Mortgage Countdown

Track your mortgage balance month by month, chart actual payoff progress, and see a forecast countdown to $0. Data lives in [`data/mortgage.json`](data/mortgage.json)—edit in Cursor, commit, and push; GitHub Actions rebuilds the site on GitHub Pages.

**Privacy:** This project is intended for a **public** repo. Balances and dates are visible in git history and on the live site.

## Live site

After enabling GitHub Pages (see below): `https://<your-github-username>.github.io/mortgage-countdown/`

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/mortgage-countdown/`).

Override the base path locally:

```bash
# Root path (optional)
set VITE_BASE=/&& npm run dev
```

## Monthly update

1. Open [`data/mortgage.json`](data/mortgage.json).
2. Append a new entry (one row per month):

```json
{ "date": "2026-11-01", "balance": 458700 }
```

3. Optionally update `forecastMonthlyReduction` if your 12‑month average principal reduction has changed.
4. Set `forecastMode` to `"auto"` to use the rolling average of up to the last 12 month‑over‑month reductions, or `"manual"` to always use `forecastMonthlyReduction`.
5. Commit and push to `main`. The deploy workflow validates JSON, runs tests, builds, and publishes.

## Scripts

| Command | Description |
| -------- | ------------- |
| `npm run dev` | Dev server |
| `npm run build` | Production build to `dist/` |
| `npm test` | Vitest (forecast math) |
| `npm run validate` | Check `mortgage.json` shape |

## GitHub Pages setup

1. Push this repo to GitHub (public).
2. **Settings → Pages → Build and deployment → Source:** GitHub Actions.
3. Push to `main`; the [Deploy to GitHub Pages](.github/workflows/deploy.yml) workflow runs on each push.

If your repo name is not `mortgage-countdown`, set `base` in [`vite.config.ts`](vite.config.ts) to `/<your-repo-name>/`.

## How the forecast works

- **Actual line:** entries from `mortgage.json`.
- **Forecast line:** straight‑line reduction from the latest balance using the effective monthly rate (manual or 12‑month average).
- **Countdown:** estimated months and payoff date from that rate—not a full amortization / interest model.

## Optional UI

- **Extra payment slider:** what‑if only; does not write to JSON.
- **Milestone chips:** progress vs your first logged balance.
