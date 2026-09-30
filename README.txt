TIME2PADEL ONLINE V3

1. login.html — entrada de administração (tiago@visioluz.com).
2. index.html — painel privado de administração.
3. jogadores.html — base central online; adicionar, editar e desativar jogadores.
4. mega-mix.html — Mega Mix 8 equipas / 4 campos.
5. mix6.html — Mix 6 equipas / 3 campos.
6. mix4.html — Mix 4 equipas / 2 campos.
7. publico.html — página pública sem login para resultados publicados.
8. cloud.js — ligação ao projeto Supabase usando apenas a Publishable key.

A base de jogadores é manual: inscrições não criam jogadores automaticamente.
Jogadores desconhecidos ficam como Sem nível e não são incluídos na contagem de vitórias.
A vitória de jogador é recalculada apenas quando a publicação tem champion definido, correspondendo ao 1.º lugar do Mix.

IMPORTANTE: nunca colocar uma Secret/service_role key no browser.
