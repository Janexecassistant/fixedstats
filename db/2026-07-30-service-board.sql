-- Service Flow Board: active repair-order workflow records.
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
    status text not null default 'checked_in',
    notes text not null default '',
    source text not null default 'manual',
    created_by uuid references public.app_users(id) on delete set null,
    updated_by uuid references public.app_users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    completed_at timestamptz,
    unique (store_id, ro_number)
);

create index if not exists service_board_ros_active_idx
    on public.service_board_ros (store_id, status, updated_at desc);

create index if not exists service_board_ros_rental_due_idx
    on public.service_board_ros (rental_due_date)
    where rental_due_date is not null;

notify pgrst, 'reload schema';
