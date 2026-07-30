-- Secure shared Dispatch and Rental Flow Board.
-- Run this file instead of the original service-board migration.
-- Browser clients may only use the token-validated RPC functions below.

create table if not exists public.service_board_ros (
  id uuid primary key default gen_random_uuid(), store_id text not null, ro_number text not null,
  customer_name text not null default '', vehicle text not null default '', rental_type text not null default '',
  rental_due_date date, check_in_date date, parts_status text not null default 'none', parts_ordered_date date,
  parts_received_date date, advisor_name text not null default '', pay_type text not null default '',
  technician text not null default '', technician_user_id uuid references public.app_users(id) on delete set null,
  estimated_hours numeric(5,2) not null default 1, job_type text not null default 'repair', required_skill text not null default '',
  priority text not null default 'standard', promised_at timestamptz, dispatch_status text not null default 'ready',
  dispatched_at timestamptz, dispatched_by uuid references public.app_users(id) on delete set null, started_at timestamptz,
  hold_reason text not null default '', status text not null default 'checked_in', notes text not null default '',
  source text not null default 'manual', created_by uuid references public.app_users(id) on delete set null,
  updated_by uuid references public.app_users(id) on delete set null, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), completed_at timestamptz, unique(store_id,ro_number)
);
create table if not exists public.service_board_events (
  id uuid primary key default gen_random_uuid(), ro_id uuid not null references public.service_board_ros(id) on delete cascade,
  store_id text not null, event_type text not null, from_technician text not null default '', to_technician text not null default '',
  note text not null default '', created_by uuid references public.app_users(id) on delete set null, created_at timestamptz not null default now()
);
create table if not exists public.rental_flow_cars (
  id uuid primary key default gen_random_uuid(), store_id text not null, ro_id uuid references public.service_board_ros(id) on delete set null,
  ro_number text not null default '', customer_name text not null default '', customer_vehicle text not null default '',
  rental_unit text not null default '', rental_provider text not null default '', status text not null default 'requested', due_date date,
  advisor_name text not null default '', notes text not null default '', created_by uuid references public.app_users(id) on delete set null,
  updated_by uuid references public.app_users(id) on delete set null, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), returned_at timestamptz
);
create index if not exists service_board_ros_active_idx on public.service_board_ros(store_id,status,updated_at desc);
create index if not exists rental_flow_cars_active_idx on public.rental_flow_cars(store_id,status,due_date);

alter table public.service_board_ros enable row level security;
alter table public.service_board_events enable row level security;
alter table public.rental_flow_cars enable row level security;
revoke all on public.service_board_ros, public.service_board_events, public.rental_flow_cars from anon, authenticated;

create or replace function public.board_authorize(p_token text, p_store_id text, p_write boolean default false)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_session public.user_sessions%rowtype; v_user public.app_users%rowtype;
begin
  select * into v_session from user_sessions where token=p_token and expires_at>now();
  if v_session is null then raise exception 'Session expired'; end if;
  select * into v_user from app_users where id=v_session.user_id and is_active=true;
  if v_user is null or (v_user.default_store is distinct from p_store_id and not exists(select 1 from user_store_access where user_id=v_user.id and store_id=p_store_id)) then raise exception 'Store access denied'; end if;
  if p_write and lower(coalesce(v_user.role,'')) not in ('admin','owner','manager','executive','fixed_ops','service_manager','dispatcher','advisor') then raise exception 'Write access denied'; end if;
  return v_user.id;
end $$;

create or replace function public.service_board_list(p_token text,p_store_id text)
returns setof public.service_board_ros language plpgsql security definer set search_path=public as $$
begin perform board_authorize(p_token,p_store_id,false); return query select * from service_board_ros where store_id=p_store_id order by updated_at desc; end $$;
create or replace function public.rental_flow_list(p_token text,p_store_id text)
returns setof public.rental_flow_cars language plpgsql security definer set search_path=public as $$
begin perform board_authorize(p_token,p_store_id,false); return query select * from rental_flow_cars where store_id=p_store_id and status<>'returned' order by due_date; end $$;

create or replace function public.service_board_save(p_token text,p_row jsonb)
returns public.service_board_ros language plpgsql security definer set search_path=public as $$
declare r public.service_board_ros; saved public.service_board_ros; uid uuid;
begin
 select * into r from jsonb_populate_record(null::public.service_board_ros,p_row); uid:=board_authorize(p_token,r.store_id,true);
 r.id:=coalesce(r.id,gen_random_uuid()); r.created_by:=coalesce(r.created_by,uid); r.updated_by:=uid; r.updated_at:=now();
 insert into service_board_ros as t select (r).* on conflict(store_id,ro_number) do update set customer_name=excluded.customer_name,vehicle=excluded.vehicle,rental_type=excluded.rental_type,rental_due_date=excluded.rental_due_date,check_in_date=excluded.check_in_date,parts_status=excluded.parts_status,advisor_name=excluded.advisor_name,pay_type=excluded.pay_type,technician=excluded.technician,technician_user_id=excluded.technician_user_id,estimated_hours=excluded.estimated_hours,job_type=excluded.job_type,required_skill=excluded.required_skill,priority=excluded.priority,promised_at=excluded.promised_at,dispatch_status=excluded.dispatch_status,dispatched_at=excluded.dispatched_at,dispatched_by=excluded.dispatched_by,hold_reason=excluded.hold_reason,status=excluded.status,notes=excluded.notes,source=excluded.source,updated_by=uid,updated_at=now(),completed_at=excluded.completed_at returning t.* into saved; return saved;
end $$;
create or replace function public.rental_flow_save(p_token text,p_row jsonb)
returns public.rental_flow_cars language plpgsql security definer set search_path=public as $$
declare r public.rental_flow_cars; saved public.rental_flow_cars; uid uuid;
begin
 select * into r from jsonb_populate_record(null::public.rental_flow_cars,p_row); uid:=board_authorize(p_token,r.store_id,true); r.id:=coalesce(r.id,gen_random_uuid()); r.created_by:=coalesce(r.created_by,uid); r.updated_by:=uid; r.updated_at:=now();
 insert into rental_flow_cars as t select (r).* on conflict(id) do update set ro_number=excluded.ro_number,customer_name=excluded.customer_name,customer_vehicle=excluded.customer_vehicle,rental_unit=excluded.rental_unit,rental_provider=excluded.rental_provider,status=excluded.status,due_date=excluded.due_date,advisor_name=excluded.advisor_name,notes=excluded.notes,updated_by=uid,updated_at=now(),returned_at=excluded.returned_at returning t.* into saved; return saved;
end $$;
grant execute on function public.service_board_list(text,text),public.rental_flow_list(text,text),public.service_board_save(text,jsonb),public.rental_flow_save(text,jsonb) to anon,authenticated;
notify pgrst,'reload schema';
