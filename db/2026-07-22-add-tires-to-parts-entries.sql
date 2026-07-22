-- Add Tires as its own Parts Daily Entry sales/gross channel.
-- Existing rows remain valid and read as zero tires.
alter table public.parts_entries
    add column if not exists tires numeric not null default 0,
    add column if not exists tires_gross numeric not null default 0;
