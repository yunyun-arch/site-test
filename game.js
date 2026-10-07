const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const heartsEl = document.getElementById('hearts');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreEl = document.getElementById('finalScore');

let width = 900, height = 560, dpr = 1;
let running = false, score = 0, hearts = 3, lastTime = 0, spawnTimer = 0, elapsed = 0;
let items = [], keys = { left: false, right: false }, dragging = false;
const player = { x: 450, y: 0, width: 102, height: 86, speed: 470 };

function resize() {
  const rect = canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width; height = rect.height;
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  player.y = height - 78; player.x = Math.max(player.width / 2, Math.min(width - player.width / 2, player.x));
}
window.addEventListener('resize', resize); resize();

function reset() { score = 0; hearts = 3; items = []; elapsed = 0; spawnTimer = 0; player.x = width / 2; updateHud(); }
function updateHud() { scoreEl.textContent = score; heartsEl.textContent = '❤️'.repeat(hearts) || '♡♡♡'; }
function startGame() { reset(); running = true; startOverlay.classList.add('hidden'); gameOverOverlay.classList.add('hidden'); lastTime = performance.now(); requestAnimationFrame(loop); }
function endGame() { running = false; finalScoreEl.textContent = score; gameOverOverlay.classList.remove('hidden'); }
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartButton').addEventListener('click', startGame);

window.addEventListener('keydown', e => { if (['ArrowLeft','a','A'].includes(e.key)) keys.left = true; if (['ArrowRight','d','D'].includes(e.key)) keys.right = true; });
window.addEventListener('keyup', e => { if (['ArrowLeft','a','A'].includes(e.key)) keys.left = false; if (['ArrowRight','d','D'].includes(e.key)) keys.right = false; });
function moveToPointer(e) { const r = canvas.getBoundingClientRect(); player.x = Math.max(player.width / 2, Math.min(width - player.width / 2, (e.clientX - r.left) * width / r.width)); }
canvas.addEventListener('pointerdown', e => { dragging = true; canvas.setPointerCapture(e.pointerId); moveToPointer(e); });
canvas.addEventListener('pointermove', e => { if (dragging) moveToPointer(e); });
canvas.addEventListener('pointerup', () => dragging = false);

function spawnItem() { items.push({ x: 48 + Math.random() * (width - 96), y: -35, size: 25 + Math.random() * 7, type: Math.random() < .2 ? 'chestnut' : 'apple', speed: 145 + Math.random() * 70 + elapsed * 3, wobble: Math.random() * 6.28 }); }
function loop(now) {
  if (!running) return;
  const dt = Math.min((now - lastTime) / 1000, .035); lastTime = now; elapsed += dt;
  if (!dragging) { player.x += ((keys.right ? 1 : 0) - (keys.left ? 1 : 0)) * player.speed * dt; player.x = Math.max(player.width / 2, Math.min(width - player.width / 2, player.x)); }
  spawnTimer -= dt; if (spawnTimer <= 0) { spawnItem(); spawnTimer = Math.max(.42, 1.05 - elapsed * .012); }
  for (let i = items.length - 1; i >= 0; i--) { const item = items[i]; item.y += item.speed * dt; item.wobble += dt * 3; item.x += Math.sin(item.wobble) * 12 * dt; if (item.y + item.size > player.y - 4 && item.y - item.size < player.y + player.height && Math.abs(item.x - player.x) < player.width / 2 + item.size * .65) { if (item.type === 'apple') score++; else hearts--; items.splice(i, 1); updateHud(); if (hearts <= 0) { endGame(); break; } } else if (item.y - item.size > height) { if (item.type === 'apple') hearts--; items.splice(i, 1); updateHud(); if (hearts <= 0) { endGame(); break; } } }
  draw(); if (running) requestAnimationFrame(loop);
}

function roundedRect(x,y,w,h,r,fill) { ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fillStyle=fill; ctx.fill(); }
function draw() { ctx.clearRect(0,0,width,height); drawBackground(); items.forEach(drawItem); drawPlayer(); }
function drawBackground() {
  const sky = ctx.createLinearGradient(0,0,0,height); sky.addColorStop(0,'#8fdded'); sky.addColorStop(1,'#d4f4d0'); ctx.fillStyle=sky; ctx.fillRect(0,0,width,height);
  ctx.fillStyle='#fff9dc'; ctx.globalAlpha=.8; [[.16,.16,58],[.72,.12,48],[.88,.28,34]].forEach(([x,y,s]) => { ctx.beginPath(); ctx.arc(width*x,height*y,s,0,Math.PI*2); ctx.arc(width*x+s*.7,height*y+6,s*.8,0,Math.PI*2); ctx.fill(); }); ctx.globalAlpha=1;
  ctx.fillStyle='#9ad78b'; ctx.beginPath(); ctx.moveTo(0,height*.72); ctx.quadraticCurveTo(width*.22,height*.55,width*.45,height*.72); ctx.quadraticCurveTo(width*.7,height*.53,width,height*.7); ctx.lineTo(width,height); ctx.lineTo(0,height); ctx.fill();
  ctx.fillStyle='#6cbd65'; ctx.fillRect(0,height-48,width,48); for(let x=0;x<width;x+=28){ctx.strokeStyle='#4eaa58';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,height-48);ctx.lineTo(x-5,height-59);ctx.moveTo(x+9,height-48);ctx.lineTo(x+14,height-58);ctx.stroke();}
  ctx.fillStyle='#8d573a'; ctx.fillRect(width*.5-38,0,76,height*.72); ctx.fillStyle='#4d9d58'; [[.37,.18,90],[.52,.11,110],[.65,.2,86],[.29,.3,68],[.75,.31,64]].forEach(([x,y,s])=>{ctx.beginPath();ctx.arc(width*x,height*y,s,0,Math.PI*2);ctx.fill();});
  ctx.font='42px serif'; ctx.fillText('🐿️',width*.5-22,82);
}
function drawItem(item) { ctx.save(); ctx.translate(item.x,item.y); if(item.type==='apple'){ctx.fillStyle='#ed594b';ctx.beginPath();ctx.arc(0,5,item.size,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff8b67';ctx.beginPath();ctx.arc(-item.size*.35,-item.size*.15,item.size*.25,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#6b9f4d';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-item.size+7);ctx.quadraticCurveTo(5,-item.size-8,14,-item.size-9);ctx.stroke();ctx.fillStyle='#75b85d';ctx.beginPath();ctx.ellipse(13,-item.size-7,10,5,.4,0,Math.PI*2);ctx.fill();}else{ctx.fillStyle='#7d4e32';ctx.beginPath();ctx.arc(0,5,item.size,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b87a4d';ctx.beginPath();ctx.arc(-6,0,item.size*.62,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff1cc';ctx.lineWidth=4;for(let a=-1;a<=1;a++){ctx.beginPath();ctx.moveTo(a*9,-item.size+3);ctx.lineTo(a*9-4, -item.size-14);ctx.stroke();}}ctx.restore(); }
function drawPlayer() { const x=player.x,y=player.y; ctx.save(); ctx.translate(x,y); ctx.font='48px serif'; ctx.textAlign='center'; ctx.fillText('🧑',0,0); roundedRect(-player.width/2,12,player.width,38,18,'#d98b48'); ctx.strokeStyle='#a85d31';ctx.lineWidth=4;ctx.stroke(); ctx.fillStyle='#f5c76b';ctx.beginPath();ctx.ellipse(0,28,30,12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff1bf';ctx.beginPath();ctx.ellipse(0,24,24,8,0,0,Math.PI*2);ctx.fill();ctx.restore(); }

draw();
