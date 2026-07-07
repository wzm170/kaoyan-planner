create table if not exists public.learning_records (
  id uuid primary key default gen_random_uuid(),
  account_name text not null,
  record_date date not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.exam_summaries (
  id uuid primary key default gen_random_uuid(),
  account_name text not null,
  exam_date date not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create policy "account can read own records"
on public.learning_records for select
using (true);

create policy "account can insert records"
on public.learning_records for insert
with check (true);

create policy "account can read own exams"
on public.exam_summaries for select
using (true);

create policy "account can insert exams"
on public.exam_summaries for insert
with check (true);
