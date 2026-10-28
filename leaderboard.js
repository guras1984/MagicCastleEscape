/* Online scores only. Game progress never leaves this browser. No login SDK. */
window.MagicRanking=(()=>{
 const base='https://lubrwnbluclmpoxnkzul.supabase.co/rest/v1/rpc/';
 const key='sb_publishable_iFW2FjdPFeMHgvi5-RfB2A_qHdQgX8g';
 function identity(){let token=localStorage.getItem('mce-ranking-device-v1');if(!token){token=crypto.randomUUID()+crypto.randomUUID();localStorage.setItem('mce-ranking-device-v1',token)}return token}
 async function rpc(name,body){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);try{
  const response=await fetch(base+name,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
  const data=await response.json();if(!response.ok)throw new Error(data.message||'랭킹 서버 오류');return data;
 }finally{clearTimeout(timer)}}
 async function start(stage,hero,difficulty){return rpc('mce_guest_start',{p_token:identity(),p_stage:stage,p_hero:hero,p_difficulty:difficulty})}
 async function finish(result,nickname){return rpc('mce_guest_finish',{p_token:identity(),p_id:result.id,p_seconds:result.seconds,p_damage:result.damage,p_nickname:nickname})}
 async function board(difficulty,hero){return rpc('mce_guest_board',{p_difficulty:difficulty,p_hero:hero})}
 function message(error){const m=String(error?.message||error);if(/fetch|network|abort|timeout/i.test(m))return '랭킹 서버에 연결하지 못했습니다. 게임 진행은 이 기기에 저장됩니다.';if(/schema cache|does not exist|PGRST/i.test(m))return '랭킹 서버 설정이 필요합니다.';if(m.includes('INVALID_RESULT'))return '기록 검증을 통과하지 못했습니다. 다음 스테이지에서 다시 도전해주세요.';return m.slice(0,180)}
 return {start,finish,board,message};
})();
