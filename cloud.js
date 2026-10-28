/* Public project configuration. No privileged credentials belong in this file. */
window.MagicCloud = (() => {
 const url='https://lubrwnbluclmpoxnkzul.supabase.co';
 const key='sb_publishable_iFW2FjdPFeMHgvi5-RfB2A_qHdQgX8g';
 let pendingClient;
 async function client(){
  if(!pendingClient)pendingClient=(async()=>{
   if(!window.supabase){await new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
    s.onload=resolve;s.onerror=()=>{s.remove();reject(new Error('연결 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해주세요.'))};document.head.append(s);
   })}
   return window.supabase.createClient(url,key,{auth:{storageKey:'mce-auth',flowType:'pkce'}});
  })().catch(e=>{pendingClient=null;throw e});
  return pendingClient;
 }
 const checked=r=>{if(r.error)throw r.error;return r.data};
 async function user(){const c=await client();return checked(await c.auth.getUser())?.user}
 async function sessionUser(){const c=await client();return checked(await c.auth.getSession())?.session?.user}
 async function requireUser(){const u=await user();if(!u)throw new Error('먼저 구글 로그인을 해주세요.');return u}
 async function read(){const u=await requireUser(),c=await client();return checked(await c.from('mce_saves').select('payload,version,updated_at').eq('user_id',u.id).maybeSingle())}
 async function write(payload,version){await requireUser();return checked(await (await client()).rpc('mce_save',{p_payload:payload,p_version:version}))}
 async function login(){
  const redirect=new URL(location.href);redirect.hash='';redirect.search='';
  checked(await (await client()).auth.signInWithOAuth({provider:'google',options:{redirectTo:redirect.href}}));
 }
 async function logout(){checked(await (await client()).auth.signOut())}
 async function start(stage,hero,difficulty){
  if(!await sessionUser())return null;
  return checked(await (await client()).rpc('mce_start_run',{p_stage:stage,p_hero:hero,p_difficulty:difficulty}));
 }
 async function finish(result,nickname){await requireUser();return checked(await (await client()).rpc('mce_finish_run',{p_id:result.id,p_seconds:result.seconds,p_damage:result.damage,p_nickname:nickname}))}
 async function board(difficulty,hero){return checked(await (await client()).rpc('mce_leaderboard',{p_difficulty:difficulty,p_hero:hero}))}
 function message(error){
  const m=String(error?.message||error);
  if(m.includes('SAVE_CONFLICT'))return '다른 기기에서 클라우드 기록이 변경되었습니다. 다시 확인한 뒤 저장해주세요.';
  if(/provider.*not enabled|Unsupported provider/i.test(m))return 'Supabase에서 구글 로그인 설정이 아직 완료되지 않았습니다.';
  if(/PGRST|schema cache|does not exist/i.test(m))return '클라우드 테이블 설정이 필요합니다. 관리자에게 알려주세요.';
  if(/session missing/i.test(m))return '먼저 구글 로그인을 해주세요.';
  if(/fetch|network|timeout/i.test(m))return '서버에 연결하지 못했습니다. 인터넷 연결을 확인해주세요.';
  if(m.includes('INVALID_RESULT'))return '기록 검증을 통과하지 못했습니다. 새 스테이지에서 다시 도전해주세요.';
  return m.slice(0,180);
 }
 return {user,sessionUser,read,write,login,logout,start,finish,board,message};
})();
