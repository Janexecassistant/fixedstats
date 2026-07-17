-- Allow Parts Counter employee accounts in Fixedstats.
--
-- The Admin UI stores this role as `parts_counter`. Preserve the live
-- constraint's exact existing predicate and add only this new value.

begin;

lock table public.app_users in access exclusive mode;

do $migration$
declare
    existing_expr text;
begin
    select pg_get_expr(c.conbin, c.conrelid, true)
      into existing_expr
    from pg_constraint c
    where c.conrelid = 'public.app_users'::regclass
      and c.conname = 'app_users_role_check'
      and c.contype = 'c';

    if existing_expr is null then
        raise exception 'Expected CHECK constraint public.app_users.app_users_role_check was not found';
    end if;

    if position('parts_counter' in existing_expr) = 0 then
        execute 'alter table public.app_users drop constraint app_users_role_check';
        execute format(
            'alter table public.app_users add constraint app_users_role_check check ((role = %L) or (%s))',
            'parts_counter',
            existing_expr
        );
    end if;
end
$migration$;

commit;

-- Verification: the result should include `parts_counter`.
select c.conname, pg_get_constraintdef(c.oid, true) as definition
from pg_constraint c
where c.conrelid = 'public.app_users'::regclass
  and c.conname = 'app_users_role_check';
