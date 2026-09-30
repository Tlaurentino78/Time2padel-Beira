// Time2Padel Cloud — Supabase client + helpers
const TP_SUPABASE_URL = 'https://gvsotgzntwfpikigoxdj.supabase.co';
const TP_SUPABASE_KEY = 'sb_publishable_zeRBh7-ziG_jgF-CTeRQRQ_NFVmFGWc';
const TP_ADMIN_EMAIL = 'tiago@visioluz.com';

const tpScript = document.createElement('script');
tpScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
tpScript.onload = () => { window.tpClient = window.supabase.createClient(TP_SUPABASE_URL, TP_SUPABASE_KEY); window.dispatchEvent(new Event('tp-supabase-ready')); };
document.head.appendChild(tpScript);

function tpWait(){return new Promise(resolve=>{if(window.tpClient) return resolve(window.tpClient); window.addEventListener('tp-supabase-ready',()=>resolve(window.tpClient),{once:true});});}
async function tpUser(){const c=await tpWait(); const {data}=await c.auth.getUser(); return data.user||null;}
async function tpRequireAdmin(){const u=await tpUser(); if(!u || u.email?.toLowerCase()!==TP_ADMIN_EMAIL.toLowerCase()){location.href='login.html'; return null;} return u;}
async function tpSignOut(){const c=await tpWait(); await c.auth.signOut(); location.href='login.html';}
function tpNorm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();}
function tpSplitTeam(s){return String(s||'').split(/\s*\/\s*/).map(x=>x.trim()).filter(Boolean);}

async function tpLoadPlayers(){
  const c=await tpWait();
  const {data,error}=await c.from('jogadores').select('*').eq('ativo',true).order('nome');
  if(error) throw error;
  return data||[];
}
function tpPlayerInfo(name, players){
  const raw=String(name||'').trim(), k=tpNorm(raw);
  const exact=players.find(p=>tpNorm(p.nome)===k); if(exact) return exact;
  const cs=players.filter(p=>{const pk=tpNorm(p.nome); return pk.startsWith(k+' ')||pk.includes(' '+k+' ')||pk.endsWith(' '+k);});
  return cs.length===1?cs[0]:{nome:raw,nivel:'Sem nível',id:null};
}
function tpFormatTeam(team,players){return tpSplitTeam(team).map(n=>{const p=tpPlayerInfo(n,players);return `${p.nome} (${p.nivel||'Sem nível'})`;}).join(' / ');}

async function tpRecalculateMixWins(){
  const c=await tpWait();
  const [{data:players,error:pe},{data:pubs,error:ue}]=await Promise.all([
    c.from('jogadores').select('*'),
    c.from('publicacoes').select('dados').eq('publicada',true)
  ]);
  if(pe) throw pe; if(ue) throw ue;
  const counts=new Map((players||[]).map(p=>[p.id,0]));
  for(const pub of pubs||[]){
    const champion=pub.dados?.champion;
    if(!champion) continue;
    for(const raw of tpSplitTeam(champion)){
      const p=(players||[]).find(x=>tpNorm(x.nome)===tpNorm(raw));
      if(p) counts.set(p.id,(counts.get(p.id)||0)+1);
    }
  }
  for(const p of players||[]){
    const {error}=await c.from('jogadores').update({vitorias_mix_1_lugar:counts.get(p.id)||0}).eq('id',p.id);
    if(error) throw error;
  }
}

async function tpPublishTournament({nome,formato,nivel=null,campos,teams,scores,games,ranking,champion}){
  const c=await tpWait();
  const {data:torneio,error:te}=await c.from('torneios').insert({
    nome,formato,nivel,data_torneio:new Date().toISOString().slice(0,10),campos,numero_equipas:teams.length,publicado:true,publicado_em:new Date().toISOString()
  }).select().single();
  if(te) throw te;

  const teamRows=teams.map((nome,i)=>({torneio_id:torneio.id,nome,posicao_inicial:i+1}));
  const {data:insertedTeams,error:ee}=await c.from('equipas').insert(teamRows).select();
  if(ee) throw ee;

  const nameToId=new Map((insertedTeams||[]).map(x=>[x.nome,x.id]));
  const gameRows=(games||[]).map(g=>({
    torneio_id:torneio.id,
    equipa_a_id:nameToId.get(g.teamA)||null,
    equipa_b_id:nameToId.get(g.teamB)||null,
    fase:g.fase||'Ronda',
    ronda:g.ronda??null,
    campo:g.campo??null,
    ordem:g.ordem??null,
    estado:g.scoreA!==null&&g.scoreA!==undefined&&g.scoreB!==null&&g.scoreB!==undefined?'terminado':'aguarda',
    score_a:g.scoreA??null, score_b:g.scoreB??null,
    vencedor_id:g.winner==='a'?nameToId.get(g.teamA):g.winner==='b'?nameToId.get(g.teamB):null
  }));
  if(gameRows.length){const {error:je}=await c.from('jogos').insert(gameRows); if(je) throw je;}

  const dados={nome,formato,nivel,teams,scores,games,ranking,champion,publicadoEm:new Date().toISOString()};
  const {error:pe}=await c.from('publicacoes').insert({torneio_id:torneio.id,titulo:nome,mensagem:'Resultados Time2Padel',publicada:true,publicada_em:new Date().toISOString(),dados});
  if(pe) throw pe;
  await tpRecalculateMixWins();
  return torneio;
}

function tpAddLogout(){
  const nav=document.querySelector('.topnav'); if(!nav || nav.querySelector('#tpLogout')) return;
  const b=document.createElement('button'); b.id='tpLogout'; b.textContent='🚪 Sair'; b.style.cssText='border:1px solid #ddd;border-radius:8px;padding:9px 11px;font-weight:800;background:#fff;'; b.onclick=tpSignOut; nav.appendChild(b);
}
