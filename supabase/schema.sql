-- МЕП-26-1: початкова схема. Застосовувати лише в окремому DEMO-проєкті.
-- УВАГА: RLS увімкнено, але політики реального доступу треба додати після
-- реалізації перевіреного серверного зв'язування Telegram ID та профілів.
create extension if not exists pgcrypto;

create table public.students (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  group_code text not null default 'МЕП-26-1',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  telegram_id text unique,
  display_name text not null,
  role text not null check (role in ('parent','student','admin')),
  created_at timestamptz not null default now()
);

create table public.parent_student (
  id uuid primary key default gen_random_uuid(),
  parent_profile_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  unique(parent_profile_id, student_id)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  lesson_date date not null,
  pair_number smallint not null check (pair_number between 1 and 12),
  subject text not null,
  status text not null check (status in ('present','absent','late','unmarked')),
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  unique(student_id, lesson_date, pair_number)
);

create table public.fees (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  amount numeric(10,2) not null check (amount >= 0),
  due_date date,
  description text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.payment_records (
  id uuid primary key default gen_random_uuid(),
  fee_id uuid not null references public.fees(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  amount_paid numeric(10,2) not null default 0 check (amount_paid >= 0),
  status text not null check (status in ('unpaid','partial','paid')),
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  unique(fee_id, student_id)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.announcement_reads (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key(announcement_id, profile_id)
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;
alter table public.profiles enable row level security;
alter table public.parent_student enable row level security;
alter table public.attendance enable row level security;
alter table public.fees enable row level security;
alter table public.payment_records enable row level security;
alter table public.announcements enable row level security;
alter table public.announcement_reads enable row level security;
alter table public.audit_log enable row level security;

-- Навмисно не додаємо permissive policies: до створення безпечних
-- helper-функцій і перевірки Telegram identity доступ через API закритий.
-- Не вимикайте RLS і не додавайте політику USING (true) для приватних таблиць.
