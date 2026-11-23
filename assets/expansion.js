/* Original ImaginaDev artwork; no third-party media requests. */
const ambientFilm=document.querySelector('.ambient-film');
const ambientButton=document.querySelector('.ambient-toggle');
let ambientVisible=false,ambientUserPaused=false,ambientExplicit=false,ambientLoaded=false;
const saveData=Boolean(navigator.connection?.saveData);
function loadAmbient(){if(ambientLoaded)return;ambientFilm.src=ambientFilm.dataset.src;ambientLoaded=true;ambientFilm.load()}
function reconcileAmbient(){
 const allowed=ambientVisible&&!document.hidden&&!paused&&!ambientUserPaused&&(!(reduced.matches||saveData)||ambientExplicit);
 if(allowed){loadAmbient();ambientFilm.play().catch(()=>{ambientButton.textContent='Play landscape';ambientButton.setAttribute('aria-pressed','false')})}
 else ambientFilm.pause();
}
ambientFilm.addEventListener('playing',()=>{ambientButton.textContent='Pause landscape';ambientButton.setAttribute('aria-pressed','true')});
ambientFilm.addEventListener('pause',()=>{ambientButton.textContent='Play landscape';ambientButton.setAttribute('aria-pressed','false')});
ambientButton.addEventListener('click',()=>{
 if(ambientFilm.paused){ambientExplicit=true;ambientUserPaused=false;if(paused)document.querySelector('.motion-button').click();reconcileAmbient()}
 else{ambientUserPaused=true;reconcileAmbient()}
});
new IntersectionObserver(entries=>{ambientVisible=entries[0].isIntersecting;reconcileAmbient()},{threshold:.12}).observe(document.querySelector('.landscape-cinema'));
document.addEventListener('visibilitychange',reconcileAmbient);
reduced.addEventListener('change',reconcileAmbient);
document.querySelector('.motion-button').addEventListener('click',reconcileAmbient);

const familyCounts=[...document.querySelectorAll('[data-count]')];
let countsStarted=false;
const countObserver=new IntersectionObserver(entries=>{
 if(!entries.some(e=>e.isIntersecting)||countsStarted)return;
 countsStarted=true;countObserver.disconnect();
 if(reduced.matches||paused)return;
 const start=performance.now(),duration=1450;
 function step(now){const t=Math.min(1,(now-start)/duration),progress=1-Math.pow(1-t,3);
  familyCounts.forEach(el=>el.textContent=String(Math.round(Number(el.dataset.count)*progress)));
  if(paused||reduced.matches){familyCounts.forEach(el=>el.textContent=el.dataset.count);return}
  if(t<1)requestAnimationFrame(step);
 }
 requestAnimationFrame(step);
},{threshold:.45});
countObserver.observe(document.querySelector('.numbers-grid'));

const companion=document.querySelector('.desk-companion'),face=document.querySelector('.companion-face'),dashboard=document.querySelector('.companion-dashboard');
const companionViews={dashboard:{src:'assets/vistello-home-dark.webp',alt:'Real Vistello prototype dashboard with globe clock, weather and system status'},toppi:{src:'assets/vistello-toppi.webp',alt:'Real Vistello prototype showing Toppi the snow leopard dressed for rainy weather'}};
document.querySelectorAll('[data-companion]').forEach(button=>button.addEventListener('click',()=>{
 const view=button.dataset.companion;companion.dataset.view=view;
 document.querySelectorAll('[data-companion]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 face.hidden=view!=='face';dashboard.hidden=view==='face';
 if(companionViews[view]){dashboard.src=companionViews[view].src;dashboard.alt=companionViews[view].alt}
}));
