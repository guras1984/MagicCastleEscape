// Stable boot sequence: attach Start immediately, load Three.js, report failures.
const btn = document.getElementById('startBtn');
const error = document.getElementById('error');
let requestedStart=false, ready=false;
function setLoading(s){btn.disabled=true;btn.innerHTML=s;btn.style.opacity='.78'}
function showError(msg){error.style.display='block';error.innerHTML='<b>3D 게임 시작 오류</b><p>'+msg+'</p><p style="font-size:12px;opacity:.9">GitHub Pages의 HTTPS 주소에서 실행하고 네트워크 차단 및 브라우저 WebGL 설정을 확인해 주세요.</p>';
btn.disabled=false;btn.innerHTML='다시 시도 ↻';btn.style.opacity='1';}
btn.addEventListener('click',()=>{
  if(ready){globalThis.__MAGIC_START__();return}
  if(error.style.display==='block'){location.reload();return}
  requestedStart=true;setLoading('3D 장면 준비 중…');
});
setLoading('3D 엔진 불러오는 중…');
try {
  let THREE;
  let lastError;
  const urls=[
    'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js',
    'https://unpkg.com/three@0.170.0/build/three.module.js',
    'https://esm.sh/three@0.170.0'
  ];
  for(const url of urls){
    try {THREE=await import(url);break;}catch(e){lastError=e;console.warn('3D CDN 연결 실패:',url,e)}
  }
  if(!THREE)throw new Error('Three.js 라이브러리를 불러오지 못했습니다. '+(lastError?.message||''));
  globalThis.__MAGIC_THREE__=THREE;
  await import('./game.js');
  if(typeof globalThis.__MAGIC_START__!=='function')throw new Error('게임 초기화는 진행됐으나 시작 함수가 등록되지 않았습니다.');
  ready=true;btn.disabled=false;btn.style.opacity='1';btn.innerHTML='모험 시작 <span>→</span>';
  if(requestedStart)globalThis.__MAGIC_START__();
}catch(e){console.error('게임 초기화 오류:',e);showError(e.message||String(e))}
