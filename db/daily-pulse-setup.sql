-- Daily Pulse leading-indicator check-ins for Fixed Stats.
-- Safe to run more than once in Supabase SQL editor.

create table if not exists public.daily_pulse_entries (
    id bigserial primary key,
    store_id text not null,
    entry_date date not null,
    role_type text not null,
    person_id text not null,
    person_name text not null default '',
    pulse_score numeric not null default 0,
    answers jsonb not null default '{}'::jsonb,
    risk_counts jsonb not null default '{}'::jsonb,
    notes text,
    submitted_by uuid references public.app_users(id) on delete set null,
    updated_at timestamptz not null default now(),
    unique (store_id, entry_date, role_type, person_id)
);

create index if not exists daily_pulse_entries_store_date_idx
    on public.daily_pulse_entries (store_id, entry_date desc);

create index if not exists daily_pulse_entries_role_date_idx
    on public.daily_pulse_entries (role_type, entry_date desc);

notify pgrst, 'reload schema';
