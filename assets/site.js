const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),small=matchMedia('(max-width:760px)'),short=matchMedia('(max-height:640px)');
let paused=false,queued=false,activeWorld=-1;
const clamp=n=>Math.max(0,Math.min(1,n));
const worlds=qs('.worlds'),cards=qsa('.world-card'),tabs=qsa('[data-world]');
function freeFlow(){return small.matches||short.matches||reduced.matches||paused}
function worldPosition(index){const r=worlds.getBoundingClientRect();return scrollY+r.top-88+(index/(cards.length-1))*(worlds.offsetHeight-(innerHeight-88))}
function goWorld(index,instant=false){if(freeFlow()){cards[index].scrollIntoView({behavior:instant||reduced.matches?'instant':'smooth',block:'start'})}else scrollTo({top:worldPosition(index),behavior:instant?'instant':'smooth'});history.replaceState(null,'',`#${cards[index].id}`)}
tabs.forEach((b,i)=>b.addEventListener('click',()=>goWorld(i)));
function render(){queued=false;const hero=qs('.hero').getBoundingClientRect();if(!paused&&!reduced.matches)qs('.hero-collage').style.setProperty('--hero-progress',clamp(-hero.top/(hero.height*.75)));
 if(!freeFlow()){
  const progress=clamp((88-worlds.getBoundingClientRect().top)/(worlds.offsetHeight-(innerHeight-88)));worlds.style.setProperty('--world-progress',progress);const index=Math.round(progress*(cards.length-1));if(index!==activeWorld){activeWorld=index;tabs.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)))}
 }else{let nearest=0,dist=Infinity;cards.forEach((c,i)=>{const d=Math.abs(c.getBoundingClientRect().top-innerHeight*.2);if(d<dist){nearest=i;dist=d}});tabs.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===nearest)))}
 if(!paused&&!reduced.matches){const r=qs('.studio-art').getBoundingClientRect(),v=clamp((innerHeight-r.top)/(innerHeight+r.height));qsa('.studio-icon').forEach((el,i)=>el.style.translate=`0 ${(v-.5)*(i%2?-25:25)}px`)}
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(render)}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);
function goSection(hash,instant=false){const i=cards.findIndex(c=>`#${c.id}`===hash);if(i>=0){goWorld(i,instant);return true}if(!/^#[a-z0-9-]+$/i.test(hash))return false;const el=qs(hash);if(!el)return false;scrollTo({top:scrollY+el.getBoundingClientRect().top-(small.matches?90:105),behavior:instant||reduced.matches||Math.abs(el.getBoundingClientRect().top)>innerHeight*2?'instant':'smooth'});history.replaceState(null,'',hash);return true}
qsa('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{if(goSection(a.getAttribute('href')))e.preventDefault()}));
qs('.world-track').addEventListener('focusin',e=>{const i=cards.findIndex(c=>c.contains(e.target));if(i>=0&&!freeFlow()&&i!==activeWorld)goWorld(i,true)});
addEventListener('load',()=>{requestAnimationFrame(()=>requestAnimationFrame(()=>goSection(location.hash,true)));schedule()});
qs('.motion-button').hidden=reduced.matches;
qs('.motion-button').addEventListener('click',e=>{paused=!paused;document.body.classList.toggle('paused',paused);e.currentTarget.textContent=paused?'Resume motion':'Pause motion';e.currentTarget.setAttribute('aria-pressed',String(paused));qsa('.studio-icon').forEach(el=>el.style.translate='');schedule()});
qs('.menu-button').addEventListener('click',e=>{const open=e.currentTarget.getAttribute('aria-expanded')==='true';e.currentTarget.setAttribute('aria-expanded',String(!open));qs('#mobile-nav').hidden=open});qsa('#mobile-nav a').forEach(a=>a.addEventListener('click',()=>{qs('#mobile-nav').hidden=true;qs('.menu-button').setAttribute('aria-expanded','false')}));
let shown=false;qs('#show-hint').addEventListener('click',e=>{shown=!shown;qs('.hint-demo').classList.toggle('revealed',shown);qs('.hint-explanation').textContent=shown?'A third light piece would make three alike. The missing piece must be dark. That’s a move you can explain.':'Two light pieces are already together. What belongs in the next square?';qs('.demo-row').setAttribute('aria-label',shown?'Light, light, dark, dark, light, dark. The third piece is dark to avoid three light pieces in a row.':'Two light pieces, an empty cell, then a dark, light and dark piece');e.currentTarget.textContent=shown?'Reset the row':'Show me why'});
qs('#play-promo').addEventListener('click',async e=>{const video=qs('#promo-video'),button=e.currentTarget;if(video.paused){try{await video.play();button.textContent='Pause the film'}catch{button.textContent='Use the film controls'}}else{video.pause();button.textContent='Play the film'}});qs('#promo-video').addEventListener('ended',()=>qs('#play-promo').textContent='Play the film');qs('#promo-video').addEventListener('pause',()=>qs('#play-promo').textContent='Play the film');
qs('#promo-video').addEventListener('playing',()=>qs('#play-promo').textContent='Pause the film');
async function syncCatalog(){
 const production=/^(www\.)?imaginadev\.com$/.test(location.hostname);let data;
 try{const r=await fetch(production?'/studio/apps.json':'assets/catalog-snapshot.json',{cache:'no-cache'});if(!r.ok)throw new Error();data=await r.json();if(!Array.isArray(data.apps))throw new Error()}catch{return}
 for(const app of data.apps){const slug=String(app.name||'').toLowerCase().replace(/[^a-z0-9-]/g,'');const id=String(app.appStoreID||'');if(!/^\d+$/.test(id))continue;const section=qsa('[data-app]').find(el=>el.dataset.app===slug);
  if(section){const action=section.querySelector('.app-action');action.replaceChildren();if(app.live===true){const a=document.createElement('a');a.className='button store-button';a.href=`https://apps.apple.com/app/id${id}`;a.textContent='View on the App Store';action.append(a);const note=section.querySelector('.app-note');if(note&&/review|soon|planned/i.test(note.textContent))note.textContent='Available now on the App Store.'}else{const span=document.createElement('span');span.className='coming-label';span.textContent='Coming soon';action.append(span)}}
  else if(app.live===true&&!['tripmory','destiq','vidscape'].includes(slug)){const article=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p'),a=document.createElement('a');h.textContent=app.name;p.textContent=app.line||'';a.textContent='View on the App Store';a.href=`https://apps.apple.com/app/id${id}`;a.className='button';article.append(h,p,a);qs('#more-apps>div').append(article);qs('#more-apps').hidden=false}
 }
}
syncCatalog();render();
