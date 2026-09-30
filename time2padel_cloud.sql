-- Time2Padel: permissões de administração
-- O administrador é identificado pelo email autenticado.

create policy "admin_gerir_jogadores"
on public.jogadores
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'tiago@visioluz.com')
with check ((auth.jwt() ->> 'email') = 'tiago@visioluz.com');

create policy "admin_gerir_torneios"
on public.torneios
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'tiago@visioluz.com')
with check ((auth.jwt() ->> 'email') = 'tiago@visioluz.com');

create policy "admin_gerir_equipas"
on public.equipas
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'tiago@visioluz.com')
with check ((auth.jwt() ->> 'email') = 'tiago@visioluz.com');

create policy "admin_gerir_equipa_jogadores"
on public.equipa_jogadores
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'tiago@visioluz.com')
with check ((auth.jwt() ->> 'email') = 'tiago@visioluz.com');

create policy "admin_gerir_jogos"
on public.jogos
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'tiago@visioluz.com')
with check ((auth.jwt() ->> 'email') = 'tiago@visioluz.com');

create policy "admin_gerir_publicacoes"
on public.publicacoes
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'tiago@visioluz.com')
with check ((auth.jwt() ->> 'email') = 'tiago@visioluz.com');

alter table public.publicacoes add column if not exists dados jsonb;
