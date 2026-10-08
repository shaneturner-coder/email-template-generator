# CLAUDE.md — Email Template Generator

Small team tool for eXp's AI Builder Green Belt: stores email templates and generates
finished emails from them. React + Vite + TypeScript. Supabase (DB + Google auth) and
Vercel are added in later prompts.

## Working agreement

- Every prompt starts with git pull and a clean-tree check. npm run build must pass before any commit.
- cmd only, never PowerShell.
- If an input is missing or something can't be done cleanly, stop and list the problem — don't improvise.

## Hard rules

- Never commit secrets. `.env` stays local. Never use or request the Supabase secret / service_role key.
- Test/sample data only — no real names, agents, or employee data.

## Project layout

- `src/App.tsx` — single-screen UI: add-template form, template table, generator panel.
- `src/types.ts` — `Template` type and the four categories.
- `src/templateUtils.ts` — `{{Variable}}` detection, segmented preview render, plain-text render.
- `src/sampleTemplates.ts` — obviously fake seed templates (local state only until Supabase lands).
- `.env` — `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (gitignored; see `.env.example`).

## Commands

- `npm run dev` — dev server.
- `npm run build` — type-check + production build; must pass before every commit.
