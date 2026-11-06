# Silicon Intern Radar

A single-page portal that pulls **RTL / ASIC / VLSI / DV / PD / DFT / analog / FPGA / embedded / hardware internships in India** straight from company career sites and job APIs.

```
index.html                    ← the whole app (same file for localhost and Netlify)
server.mjs                    ← local server: serves index.html + /api/proxy (no npm install)
netlify/functions/proxy.mjs   ← the same proxy as a Netlify Function
netlify.toml                  ← Netlify config
start.bat                     ← double-click to run locally on Windows
```

## Run locally

Needs Node 18+ (you have Node 24). Either double-click `start.bat`, or:

```bash
node server.mjs
```

Then open http://localhost:8080.

## Deploy to Netlify

The proxy is a Netlify Function, so deploy with the CLI or Git. **Netlify Drop (drag-and-drop) does not deploy functions**, so a dropped site runs in "limited mode".

**Option A: CLI**
```bash
npx netlify-cli login
```
```bash
npx netlify-cli deploy --prod --dir . --functions netlify/functions
```

**Option B: Git.** Push this folder to GitHub, then in Netlify choose "Add new site → Import from Git". `netlify.toml` already sets publish dir `.` and functions dir `netlify/functions`, with no build command.

## Where the jobs come from

| Source | Companies | Needs proxy? |
|---|---|---|
| Workday career sites (India filter applied) | NVIDIA, Intel, Analog Devices, Marvell, NXP, Micron, Cadence, Microchip, Broadcom, Samsung Semiconductor, Applied Materials, KLA, GlobalFoundries, Ciena | yes |
| AMD careers API | AMD | yes |
| Greenhouse | Tenstorrent, Astera Labs, SambaNova, Baya Systems | no |
| Ashby | Axelera AI, d-Matrix, Quadric | no |
| JSearch (optional key): LinkedIn, Indeed, Glassdoor, Naukri… | any | no |
| Adzuna India (optional key) | any | yes (falls back to direct) |

If you open `index.html` directly as a file, or from a Netlify Drop site, the page still works with the "no" rows. Alternatively, set **Settings → Refresh & proxy → Proxy base URL** to your Netlify site so a local copy uses that proxy.

Qualcomm, TI, Synopsys, Siemens EDA, Infineon, MediaTek, ST, Renesas and Arm block automated access, so they appear as quick links in the sidebar.

## Features

- **Filters:** internship words, India location words, exclude words, and editable role categories (Settings → Keywords). The "Keyword-matched roles only" toggle is useful once JSearch/Adzuna bring in non-chip companies.
- **Companies:** add any Workday, Greenhouse, Lever or Ashby board from Settings → Companies by pasting its careers URL.
- **Tracking:** ☆ save, ✓ applied (with date), ✕ hide. Stored in your browser's localStorage. Export/import is under Settings → Refresh & proxy.
- **Auto-refresh:** 30 min by default while the page is open. New postings get a **NEW** badge, and you can turn on desktop notifications. JSearch/Adzuna are left out of auto-refresh by default to save free quota.

Note: localhost and your Netlify site are different origins, so each keeps its own saved/applied list. Use Export/Import to move them between the two.
