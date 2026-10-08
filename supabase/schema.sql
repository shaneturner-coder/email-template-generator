-- Email Template Generator: templates table with per-user Row Level Security.
-- Run in Supabase SQL Editor.

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  category text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.templates enable row level security;

-- Each signed-in user may only see and manage their own rows.
create policy "templates_select_own"
  on public.templates for select
  to authenticated
  using (user_id = auth.uid());

create policy "templates_insert_own"
  on public.templates for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "templates_update_own"
  on public.templates for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "templates_delete_own"
  on public.templates for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.templates to authenticated;
