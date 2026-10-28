begin;
-- Online scores only; all game progress stays in localStorage.
create table if not exists public.mce_guest_runs(
 id uuid primary key default gen_random_uuid(), owner_hash text not null,
 stage integer not null check(stage between 1 and 30),hero integer not null check(hero in(0,1)),
 difficulty text not null check(difficulty in('easy','normal','hard')),
 started_at timestamptz not null default now(),finished_at timestamptz,
 nickname text,seconds integer,stars integer
);
alter table public.mce_guest_runs enable row level security;
revoke all on public.mce_guest_runs from public,anon,authenticated;
create index if not exists mce_guest_owner on public.mce_guest_runs(owner_hash,started_at desc);
create index if not exists mce_guest_board on public.mce_guest_runs(difficulty,hero,stage) where stars is not null;
create or replace function public.mce_guest_start(p_token text,p_stage integer,p_hero integer,p_difficulty text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v uuid; h text;
begin
 if p_token is null or char_length(p_token) not between 64 and 128 then raise exception 'INVALID_DEVICE';end if;
 h:=encode(sha256(convert_to(p_token,'UTF8')),'hex');
 if(select count(*) from public.mce_guest_runs where owner_hash=h and started_at>now()-interval '1 minute')>=10 then raise exception 'TOO_MANY_RUNS';end if;
 insert into public.mce_guest_runs(owner_hash,stage,hero,difficulty) values(h,p_stage,p_hero,p_difficulty) returning id into v;return v;
end $$;
create or replace function public.mce_guest_finish(p_token text,p_id uuid,p_seconds integer,p_damage integer,p_nickname text)
returns void language plpgsql security definer set search_path='' as $$
declare r public.mce_guest_runs;h text;
begin
 if p_token is null or char_length(p_token) not between 64 and 128 then raise exception 'INVALID_DEVICE';end if;
 h:=encode(sha256(convert_to(p_token,'UTF8')),'hex');
 select * into r from public.mce_guest_runs where id=p_id and owner_hash=h for update;
 if not found then raise exception 'RUN_NOT_FOUND';end if;
 if r.finished_at is not null then return;end if;
 if p_seconds is null or p_damage is null or p_nickname is null or p_seconds<3 or p_seconds>86400 or p_damage<0 or p_damage>10000
 or char_length(trim(p_nickname)) not between 2 and 16 or p_nickname ~ '[[:cntrl:]<>]'
 or now()-r.started_at<make_interval(secs=>p_seconds-2) or now()-r.started_at>interval '7 days' then raise exception 'INVALID_RESULT';end if;
 update public.mce_guest_runs set finished_at=now(),seconds=p_seconds,nickname=trim(p_nickname),stars=1+case when p_damage<=2 then 1 else 0 end+case when p_damage=0 and p_seconds<125 then 1 else 0 end where id=r.id;
end $$;
create or replace function public.mce_guest_board(p_difficulty text,p_hero integer)
returns table(nickname text,cleared bigint,stars bigint,seconds bigint)
language sql stable security definer set search_path='' as $$
 with best as(select distinct on(owner_hash,stage) owner_hash,stage,stars,seconds from public.mce_guest_runs where finished_at is not null and difficulty=p_difficulty and hero=p_hero order by owner_hash,stage,stars desc,seconds asc),
 names as(select distinct on(owner_hash) owner_hash,nickname from public.mce_guest_runs where finished_at is not null order by owner_hash,finished_at desc)
 select n.nickname,count(*),sum(b.stars)::bigint,sum(b.seconds)::bigint from best b join names n using(owner_hash)
 group by b.owner_hash,n.nickname order by count(*) desc,sum(b.stars) desc,sum(b.seconds) asc,b.owner_hash limit 50;
$$;
revoke all on function public.mce_guest_start(text,integer,integer,text),public.mce_guest_finish(text,uuid,integer,integer,text),public.mce_guest_board(text,integer) from public,anon,authenticated;
grant execute on function public.mce_guest_start(text,integer,integer,text),public.mce_guest_finish(text,uuid,integer,integer,text),public.mce_guest_board(text,integer) to anon,authenticated;
-- Disable legacy cloud-save access without deleting previously stored data.
do $$ begin
 if to_regclass('public.mce_saves') is not null then execute 'revoke all on public.mce_saves from anon,authenticated';end if;
 if to_regprocedure('public.mce_save(jsonb,bigint)') is not null then execute 'revoke all on function public.mce_save(jsonb,bigint) from public,anon,authenticated';end if;
end $$;
commit;
