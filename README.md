# Email Template Generator

A team tool that stores reusable email templates with `{{variables}}` and generates finished
emails from them. Built for eXp's AI Builder Green Belt.

## Features

- Google sign-in (Supabase Auth)
- Add, edit, and delete templates
- Automatic `{{variable}}` detection
- Generator with live preview, blank-field highlighting, and one-click copy
- Per-user data via Row Level Security

## Stack

React + Vite + TypeScript, Supabase (Postgres + Auth + RLS), Vercel.

## Live app

https://email-template-generator-amber.vercel.app

## Local setup

```sh
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Database schema lives in [supabase/schema.sql](supabase/schema.sql).

> **Note:** test/sample data only — no real names, agents, or employee data.
