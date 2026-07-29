# SiteSignal

**Spot construction delays and cost overruns before they derail a project** — a B2B risk tool for Indian real estate developers.

**Live demo:** https://construction-warning-system.vercel.app — no account needed, just click **"View demo (no sign-in)"** to explore the app read-only.

---

## What it does

- **Tracks projects and their milestones**, and flags which ones are slipping behind schedule.
- **Scores each project's delay risk as Low / Medium / High** by comparing where a milestone *should* be against where it actually is — so a manager sees the worst-off projects at a glance.
- **Writes a plain-English risk summary and recommendations** for any project on demand.
- **Signs users in with Google** and supports role-based access (user / admin), plus a one-click **read-only guest mode** so anyone can try it without signing up.
- **Built for Indian real estate developers** — budgets in ₹, and a data model with RERA compliance fields.

---

## Tech stack

**App:** Next.js 16 (App Router, Server Actions) · React 19 · TypeScript
**Data:** PostgreSQL (Neon) · Prisma 7 (driver adapters)
**Auth:** Auth.js v5 (`next-auth`) + Prisma adapter · Google OAuth
**AI:** Google Gemini (`gemini-flash-latest`)
**UI / Test / Deploy:** Tailwind CSS v4 · Vitest · Vercel

---

## Architecture highlights

These are the design decisions I'd want to talk through in an interview.

- **Planned progress is computed on every read, never stored.** Instead of saving a "% planned" column that anyone could edit to hide slippage, `calculatePlannedProgress(start, end, today)` derives it from the schedule dates each time the page loads. The number the risk engine compares against is therefore always current and can't be gamed by editing a field. (`today` is passed in rather than read inside the function, so the branches — before start, after end, midpoint — are unit-testable.)

- **LLM summaries are grounded and DB-cached.** The risk engine does all the math; Gemini only *narrates* the numbers it's handed and is instructed to invent nothing, and its reply is `JSON.parse`d and type-checked before the app trusts it. Each summary is cached on the `Project` row with a 24-hour freshness window and is invalidated the moment any milestone changes — so I'm not paying for a model call on every page view, and I never show a stale story after the underlying data moved.

- **Role checks live in the data layer (Server Actions), not middleware.** Every mutating action calls a guard (`requireNonGuest()` / `requireAdmin()`) as its first line, and gated pages re-check the session server-side. I deliberately did *not* put auth in Next.js middleware: **CVE-2025-29927** showed middleware can be bypassed with a crafted header, so the check sits right next to the database write it protects, where a request can't skip it.

- **The risk engine is pure functions, unit-tested.** All scoring logic — schedule variance, delay days, cost impact, planned progress — lives in `src/lib/risk.ts` as pure functions with no database or I/O, covered by Vitest. The tests pin down the tricky cases on purpose: divide-by-zero and negative-delay guards, and the clamp branches of planned progress. Pure + deterministic means the edge cases are provable, not hopeful.

---

## Running locally

Requires **Node.js 20 or later** (developed on Node 24) and a **PostgreSQL** database (a free [Neon](https://neon.tech) project works well).

```bash
# 1. Clone
git clone https://github.com/ronakagrawal-ui/construction-warning-system.git
cd construction-warning-system

# 2. Install dependencies (postinstall runs `prisma generate` for you)
npm install

# 3. Set up environment variables
#    Copy the example file, then fill in each value.
cp .env.example .env
```

Set the following in `.env` (names only — see [`.env.example`](.env.example) for notes on each):

| Variable | What it's for |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (Neon pooled) |
| `AUTH_SECRET` | Signs Auth.js session JWTs |
| `AUTH_URL` | Canonical app URL (`http://localhost:3000` in dev) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client credentials |
| `ALLOWED_EMAILS` | Comma-separated emails allowed to sign in with Google |
| `GEMINI_API_KEY` | Google Gemini key for AI summaries |

```bash
# 4. Apply the database schema (creates all tables)
npx prisma migrate dev

# 5. (optional) Load sample data
npx prisma db seed

# 6. Start the dev server → http://localhost:3000
npm run dev
```

Other scripts: `npm test` (Vitest), `npm run build` (production build), `npx prisma studio` (browse the data).

> **Tip:** you don't need Google OAuth configured just to look around — the **"View demo (no sign-in)"** button on the landing page logs you in as a read-only guest.

---

## Status / roadmap

**Done and live:**
- Full CRUD for projects, milestones, and contractors (forms → Server Actions → Prisma).
- Pure, unit-tested risk engine with per-project "worst risk wins" scoring.
- Grounded, schema-validated AI risk summaries with a 24h DB cache + invalidation on data change.
- Google OAuth with user / admin / guest roles, enforced in Server Actions; read-only guest demo mode.
- Deployed on Vercel (auto-deploy from `main`), PostgreSQL on Neon.

**Deliberately parked (data model is ready, feature isn't built):**
- **RERA compliance module** — the `Compliance` model already carries `escrowRequired`, `lastReraUpdate`, `possessionLiabilityFlag`, etc.; the quarterly-update and escrow-tracking features are future work.
- **Summary history** — the current design caches one *latest* summary per project; keeping every generated summary with a milestone snapshot (to show how risk evolved over time) is a planned addition, not a bug.

**Known rough edges (safe, not yet polished):**
- Guests still *see* Add / Delete buttons that error on click — writes are blocked server-side, so data is safe, but the buttons should be hidden for guests.
- Allow-list and admin role are assigned manually today; a production version would use an invite / admin-management flow.

---

*Solo full-stack learning + resume project. Every claim above is demonstrable in the code.*
