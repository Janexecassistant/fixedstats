-- Technician closed-hour scorecards for the Dispatch Board.
-- Weekly totals are calculated Saturday-Friday from completed_at; monthly
-- totals use the calendar month. No destructive reset job is required.

alter table public.service_board_ros
  add column if not exists closed_hours numeric(7,2) not null default 0;

update public.service_board_ros
set closed_hours = greatest(coalesce(estimated_hours,0),0)
where status='completed' and coalesce(closed_hours,0)=0;

create or replace function public.service_board_save(p_token text,p_row jsonb)
returns public.service_board_ros language plpgsql security definer set search_path=public as $$
declare r public.service_board_ros; saved public.service_board_ros; uid uuid;
begin
  select * into r from jsonb_populate_record(null::public.service_board_ros,p_row);
  uid:=board_authorize(p_token,r.store_id,true);
  r.id:=coalesce(r.id,gen_random_uuid());
  r.created_by:=coalesce(r.created_by,uid);
  r.updated_by:=uid;
  r.created_at:=coalesce(r.created_at,now());
  r.status_changed_at:=coalesce(r.status_changed_at,r.updated_at,r.created_at,now());
  r.closed_hours:=case when r.status='completed' and coalesce(r.closed_hours,0)=0 then greatest(coalesce(r.estimated_hours,0),0) else coalesce(r.closed_hours,0) end;
  r.updated_at:=now();

  insert into service_board_ros as t
  select (r).*
  on conflict(store_id,ro_number) do update set
    customer_name=excluded.customer_name,
    vehicle=excluded.vehicle,
    needs_rental=excluded.needs_rental,
    rental_type=excluded.rental_type,
    rental_due_date=excluded.rental_due_date,
    check_in_date=excluded.check_in_date,
    parts_status=excluded.parts_status,
    advisor_name=excluded.advisor_name,
    pay_type=excluded.pay_type,
    technician=excluded.technician,
    technician_user_id=excluded.technician_user_id,
    estimated_hours=excluded.estimated_hours,
    closed_hours=excluded.closed_hours,
    job_type=excluded.job_type,
    required_skill=excluded.required_skill,
    priority=excluded.priority,
    promised_at=excluded.promised_at,
    dispatch_status=excluded.dispatch_status,
    dispatched_at=excluded.dispatched_at,
    dispatched_by=excluded.dispatched_by,
    hold_reason=excluded.hold_reason,
    status_changed_at=case when t.status is distinct from excluded.status then now() else t.status_changed_at end,
    status=excluded.status,
    notes=excluded.notes,
    source=excluded.source,
    updated_by=uid,
    updated_at=now(),
    completed_at=excluded.completed_at
  returning t.* into saved;
  return saved;
end $$;

grant execute on function public.service_board_save(text,jsonb) to anon,authenticated;
notify pgrst,'reload schema';
