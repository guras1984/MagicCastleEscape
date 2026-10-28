begin;
create table if not exists public.mce_saves (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null check (octet_length(payload::text) <= 524288),
 version bigint not null default 1,
 updated_at timestamptz not null default now()
);
alter table public.mce_saves enable row level security;
revoke all on public.mce_saves from anon, authenticated;
grant select on public.mce_saves to authenticated;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='mce_saves' and policyname='read_own_save') then
 create policy read_own_save on public.mce_saves for select to authenticated using ((select auth.uid())=user_id);
 end if;
end $$;
create or replace function public.mce_save(p_payload jsonb, p_version bigint)
returns bigint language plpgsql security definer set search_path='' as $$
declare v bigint;
begin
 if auth.uid() is null then raise exception 'LOGIN_REQUIRED'; end if;
 if p_version is null or p_version<0 or p_payload is null or p_payload->>'format' is distinct from 'mce-v2' or octet_length(p_payload::text)>524288 then raise exception 'INVALID_SAVE'; end if;
 insert into public.mce_saves(user_id,payload,version) values(auth.uid(),p_payload,1)
 on conflict(user_id) do update set payload=excluded.payload,version=mce_saves.version+1,updated_at=now()
 where mce_saves.version=p_version returning version into v;
 if v is null then raise exception 'SAVE_CONFLICT'; end if;
 return v;
end $$;
create table if not exists public.mce_runs (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 stage integer not null check(stage between 1 and 30), hero integer not null check(hero in (0,1)),
 difficulty text not null check(difficulty in ('easy','normal','hard')),
 started_at timestamptz not null default now(), finished_at timestamptz,
 nickname text, seconds integer, stars integer
);
alter table public.mce_runs enable row level security;
revoke all on public.mce_runs from anon, authenticated;
create index if not exists mce_runs_user on public.mce_runs(user_id,started_at desc);
create index if not exists mce_runs_board on public.mce_runs(difficulty,hero,stage) where stars is not null;
create or replace function public.mce_start_run(p_stage integer,p_hero integer,p_difficulty text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v uuid;
begin
 if auth.uid() is null then raise exception 'LOGIN_REQUIRED'; end if;
 if (select count(*) from public.mce_runs where user_id=auth.uid() and started_at>now()-interval '1 minute')>=10 then raise exception 'TOO_MANY_RUNS'; end if;
 insert into public.mce_runs(user_id,stage,hero,difficulty) values(auth.uid(),p_stage,p_hero,p_difficulty) returning id into v;
 return v;
end $$;
create or replace function public.mce_finish_run(p_id uuid,p_seconds integer,p_damage integer,p_nickname text)
returns void language plpgsql security definer set search_path='' as $$
declare r public.mce_runs; v_stars integer;
begin
 select * into r from public.mce_runs where id=p_id and user_id=auth.uid() for update;
 if not found then raise exception 'RUN_NOT_FOUND'; end if;
 if r.finished_at is not null then return; end if;
 if p_seconds is null or p_damage is null or p_nickname is null or p_seconds<3 or p_seconds>86400 or p_damage<0 or p_damage>10000
 or char_length(trim(p_nickname)) not between 2 and 16 or p_nickname ~ '[[:cntrl:]<>]'
 or now()-r.started_at<make_interval(secs=>p_seconds-2) or now()-r.started_at>interval '7 days' then raise exception 'INVALID_RESULT'; end if;
 v_stars:=1+case when p_damage<=2 then 1 else 0 end+case when p_damage=0 and p_seconds<125 then 1 else 0 end;
 update public.mce_runs set finished_at=now(),seconds=p_seconds,stars=v_stars,nickname=trim(p_nickname) where id=r.id;
end $$;
create or replace function public.mce_leaderboard(p_difficulty text,p_hero integer)
returns table(nickname text,cleared bigint,stars bigint,seconds bigint)
language sql stable security definer set search_path='' as $$
 with best as (
 select distinct on(user_id,stage) user_id,stage,stars,seconds
 from public.mce_runs where finished_at is not null and difficulty=p_difficulty and hero=p_hero
 order by user_id,stage,stars desc,seconds asc
 ), names as (
 select distinct on(user_id) user_id,nickname from public.mce_runs
 where finished_at is not null order by user_id,finished_at desc
 )
 select n.nickname,count(*),sum(b.stars)::bigint,sum(b.seconds)::bigint
 from best b join names n using(user_id) group by b.user_id,n.nickname
 order by count(*) desc,sum(b.stars) desc,sum(b.seconds) asc,b.user_id limit 50;
$$;
revoke all on function public.mce_save(jsonb,bigint) from public,anon,authenticated;
revoke all on function public.mce_start_run(integer,integer,text) from public,anon,authenticated;
revoke all on function public.mce_finish_run(uuid,integer,integer,text) from public,anon,authenticated;
revoke all on function public.mce_leaderboard(text,integer) from public,anon,authenticated;
grant execute on function public.mce_save(jsonb,bigint),public.mce_start_run(integer,integer,text),public.mce_finish_run(uuid,integer,integer,text) to authenticated;
grant execute on function public.mce_leaderboard(text,integer) to anon,authenticated;
commit;
