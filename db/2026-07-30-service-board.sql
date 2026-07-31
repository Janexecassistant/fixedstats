-- Dispatch Flow: active repair-order workflow records.
-- Run this once in the Supabase SQL editor before using the shared board.

create table if not exists public.service_board_ros (
    id uuid primary key default gen_random_uuid(),
    store_id text not null,
    ro_number text not null,
    customer_name text not null default '',
    vehicle text not null default '',
    rental_type text not null default '',
    rental_due_date date,
    check_in_date date,
    parts_status text not null default 'none',
    parts_ordered_date date,
    parts_received_date date,
    advisor_name text not null default '',
    pay_type text not null default '',
    technician text not null default '',
    technician_user_id uuid references public.app_users(id) on delete set null,
    estimated_hours numeric(5,2) not null default 1.00,
    job_type text not null default 'repair',
    required_skill text not null default '',
    priority text not null default 'standard',
    promised_at timestamptz,
    dispatch_status text not null default 'ready',
    dispatched_at timestamptz,
    dispatched_by uuid references public.app_users(id) on delete set null,
    started_at timestamptz,
    hold_reason text not null default '',
    status text not null default 'checked_in',
    status_changed_at timestamptz not null default now(),
    notes text not null default '',
    source text not null default 'manual',
    created_by uuid references public.app_users(id) on delete set null,
    updated_by uuid references public.app_users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    completed_at timestamptz,
    unique (store_id, ro_number)
);

-- Safe to run on an already-created Dispatch Flow board. These fields turn the
-- board into a dispatch desk while retaining the original intake records.
alter table public.service_board_ros add column if not exists technician_user_id uuid references public.app_users(id) on delete set null;
alter table public.service_board_ros add column if not exists estimated_hours numeric(5,2) not null default 1.00;
alter table public.service_board_ros add column if not exists job_type text not null default 'repair';
alter table public.service_board_ros add column if not exists required_skill text not null default '';
alter table public.service_board_ros add column if not exists priority text not null default 'standard';
alter table public.service_board_ros add column if not exists promised_at timestamptz;
alter table public.service_board_ros add column if not exists dispatch_status text not null default 'ready';
alter table public.service_board_ros add column if not exists dispatched_at timestamptz;
alter table public.service_board_ros add column if not exists dispatched_by uuid references public.app_users(id) on delete set null;
alter table public.service_board_ros add column if not exists started_at timestamptz;
alter table public.service_board_ros add column if not exists hold_reason text not null default '';
alter table public.service_board_ros add column if not exists status_changed_at timestamptz not null default now();

create table if not exists public.service_board_events (
    id uuid primary key default gen_random_uuid(),
    ro_id uuid not null references public.service_board_ros(id) on delete cascade,
    store_id text not null,
    event_type text not null,
    from_technician text not null default '',
    to_technician text not null default '',
    note text not null default '',
    created_by uuid references public.app_users(id) on delete set null,
    created_at timestamptz not null default now()
);

-- Rental Flow: one live record per loaner/rental handoff, linked back to the RO.
create table if not exists public.rental_flow_cars (
    id uuid primary key default gen_random_uuid(),
    store_id text not null,
    ro_id uuid references public.service_board_ros(id) on delete set null,
    ro_number text not null default '',
    customer_name text not null default '',
    customer_vehicle text not null default '',
    rental_unit text not null default '',
    rental_provider text not null default '',
    status text not null default 'requested',
    due_date date,
    advisor_name text not null default '',
    notes text not null default '',
    created_by uuid references public.app_users(id) on delete set null,
    updated_by uuid references public.app_users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    returned_at timestamptz
);

create index if not exists service_board_ros_active_idx
    on public.service_board_ros (store_id, status, updated_at desc);

create index if not exists service_board_ros_rental_due_idx
    on public.service_board_ros (rental_due_date)
    where rental_due_date is not null;

create index if not exists service_board_ros_dispatch_idx
    on public.service_board_ros (store_id, dispatch_status, priority, promised_at);

create index if not exists service_board_events_ro_idx
    on public.service_board_events (ro_id, created_at desc);

create index if not exists rental_flow_cars_active_idx
    on public.rental_flow_cars (store_id, status, due_date);

notify pgrst, 'reload schema';
