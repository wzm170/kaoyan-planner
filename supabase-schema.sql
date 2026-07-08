create table if not exists public.learning_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) default auth.uid(),
  account_name text not null,
  record_date date not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.exam_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) default auth.uid(),
  account_name text not null,
  exam_date date not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.learning_records enable row level security;
alter table public.exam_summaries enable row level security;

drop policy if exists "account can read own records" on public.learning_records;
drop policy if exists "account can insert records" on public.learning_records;
drop policy if exists "account can read own exams" on public.exam_summaries;
drop policy if exists "account can insert exams" on public.exam_summaries;

create policy "account can read own records"
on public.learning_records for select
using (auth.uid() = user_id);

create policy "account can insert records"
on public.learning_records for insert
with check (auth.uid() = user_id);

create policy "account can read own exams"
on public.exam_summaries for select
using (auth.uid() = user_id);

create policy "account can insert exams"
on public.exam_summaries for insert
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'record-images',
  'record-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read record images" on storage.objects;
drop policy if exists "authenticated can upload record images" on storage.objects;

create policy "public can read record images"
on storage.objects for select
using (bucket_id = 'record-images');

create policy "authenticated can upload record images"
on storage.objects for insert
with check (bucket_id = 'record-images' and auth.role() = 'authenticated');
