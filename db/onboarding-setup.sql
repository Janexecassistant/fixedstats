-- Onboarding readiness records for fixedstats.
-- Run this in Supabase after deploying the UI if the table does not exist yet.

create table if not exists public.onboarding_records (
    person_key text primary key,
    path_key text not null,
    training_complete boolean not null default false,
    observation_complete boolean not null default false,
    go_live_ready boolean not null default false,
    commission_released boolean not null default false,
    started_at date,
    updated_at timestamptz not null default now(),
    updated_by text
);

create index if not exists idx_onboarding_records_path
    on public.onboarding_records (path_key);

alter table public.onboarding_records enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'onboarding_records'
          and policyname = 'Allow anon onboarding read'
    ) then
        create policy "Allow anon onboarding read"
            on public.onboarding_records
            for select
            using (true);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'onboarding_records'
          and policyname = 'Allow anon onboarding write'
    ) then
        create policy "Allow anon onboarding write"
            on public.onboarding_records
            for all
            using (true)
            with check (true);
    end if;
end $$;
