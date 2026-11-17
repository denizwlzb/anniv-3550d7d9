const FACE = new Image(); FACE.src = FACE_SRC;
const cv = document.getElementById(`c`), g = cv.getContext(`2d`);
const W = 800, H = 450, GY = 380, WORLD = 4200;
const keys = {};
addEventListener(`keydown`, e => { keys[e.code] = true; if ([`Space`,`ArrowUp`,`ArrowDown`].includes(e.code)) e.preventDefault(); if (e.code === `KeyE`) doEmote(); });
addEventListener(`keyup`, e => keys[e.code] = false);
for (const [id, k] of [[`left`,`ArrowLeft`],[`right`,`ArrowRight`],[`jump`,`Space`]]) {
  const el = document.getElementById(id);
  const on = e => { e.preventDefault(); keys[k] = true; el.classList.add(`on`); };
  const off = e => { e.preventDefault(); keys[k] = false; el.classList.remove(`on`); };
  el.addEventListener(`touchstart`, on); el.addEventListener(`touchend`, off); el.addEventListener(`touchcancel`, off);
  el.addEventListener(`mousedown`, on); el.addEventListener(`mouseup`, off);
}
const em = document.getElementById(`emote`);
em.addEventListener(`touchstart`, e => { e.preventDefault(); doEmote(); });
em.addEventListener(`mousedown`, e => { e.preventDefault(); doEmote(); });

const ground = [[0,900],[1050,700],[1900,600],[2650,800],[3550,650]];
const plats = [[350,290,120],[600,235,120],[1250,290,120],[1500,235,110],[2100,290,120],[2300,235,120],[2800,290,120],[3000,235,120],[3350,300,100],[3450,250,80]];
const solids = ground.map(([x,w]) => ({x,y:GY,w})).concat(plats.map(([x,y,w]) => ({x,y,w})));
const checkpoints = [0, 1050, 1900, 2650, 3550];
const itemSpots = [[250,330],[400,240],[650,185],[1150,330],[1300,240],[1550,185],[2000,330],[2150,240],[2350,185],[2750,330],[2850,240],[3050,185],[3400,200]];
let items, enemies, boss, player, cam, state, msg, msgT, deaths, score, cp, t, confetti, fx, shake, spin;

function reset() {
  items = itemSpots.map(([x,y],i) => ({x,y,got:false,d:CONFIG.items[i % CONFIG.items.length]}));
  enemies = [[500,0,ground[0]],[900,0,ground[0]],[1300,1,ground[1]],[1600,1,ground[1]],[2050,2,ground[2]],[2300,2,ground[2]],[2900,3,ground[3]],[3150,3,ground[3]]].map(([x,k,seg]) => ({
    x, y: GY-34, w:34, h:34, vx: 1.1, min: seg[0]+10, max: seg[0]+seg[1]-44, dead:false, d:CONFIG.enemies[k % CONFIG.enemies.length]}));
  enemies = enemies.filter(e => e.x > e.min && e.x < e.max);
  boss = {x:3750,y:GY-80,w:80,h:80,vx:1.6,min:3600,max:4020,hp:CONFIG.boss.hp,dead:false,flash:0};
  player = {x:60,y:GY-64,w:34,h:64,vx:0,vy:0,ground:false,face:1};
  cam = 0; msg = ``; msgT = 0; deaths = 0; score = 0; cp = 0; t = 0; confetti = []; fx = []; shake = 0; spin = 0;
}
function say(s, d=150) { msg = s; msgT = d; }
function pop(txt, size, life, dx) { fx.push({x: player.x + 17 + (dx || (Math.random()-.5)*40), y: player.y - 30, vy: -1.3, txt, size: size || 34, life: life || 70, max: life || 70}); }
function doEmote() { if (state !== `play`) return; pop(CONFIG.emotes[Math.floor(Math.random()*CONFIG.emotes.length)], 40, 80); }
function respawn(reason) {
  deaths++; shake = 18;
  pop(`💀`, 50, 60); pop(`😭`, 44, 60, 25);
  player.x = checkpoints[cp] + 40; player.y = GY - 70; player.vx = player.vy = 0;
  say(reason || CONFIG.lose[deaths % CONFIG.lose.length], 170);
}
function start() { reset(); state = `intro`; }
start();
function press() { if (state === `intro`) { state = `play`; pop(`👟`, 44, 60); } else if (state === `win` && t > 120) start(); }
cv.addEventListener(`touchstart`, press); cv.addEventListener(`mousedown`, press);
addEventListener(`keydown`, e => { if (e.code === `Space` || e.code === `Enter`) press(); });

function update() {
  t++;
  if (shake > 0) shake--;
  for (const f of fx) { f.y += f.vy; f.life--; }
  fx = fx.filter(f => f.life > 0);
  if (state === `win`) { for (const c of confetti) { c.x += c.vx; c.y += c.vy; c.vy += .03; if (c.y > H + 20) { c.y = -20; c.x = Math.random()*W; c.vy = 1 + Math.random()*2; } } return; }
  if (state !== `play`) return;
  const p = player;
  const L = keys.ArrowLeft || keys.KeyA || keys.KeyQ, R = keys.ArrowRight || keys.KeyD;
  const J = keys.Space || keys.ArrowUp || keys.KeyW || keys.KeyZ;
  p.vx = (R ? 4.6 : 0) - (L ? 4.6 : 0);
  if (p.vx) p.face = Math.sign(p.vx);
  if (J && p.ground) { p.vy = -13.2; p.ground = false; pop(`💨`, 28, 35, 0); }
  p.vy += .62; if (p.vy > 16) p.vy = 16;
  const prevBottom = p.y + p.h;
  p.x += p.vx; p.y += p.vy;
  if (p.x < 0) p.x = 0; if (p.x > WORLD - p.w) p.x = WORLD - p.w;
  p.ground = false;
  for (const s of solids) {
    if (p.x + p.w > s.x && p.x < s.x + s.w && prevBottom <= s.y + 1 && p.y + p.h >= s.y && p.vy >= 0) {
      p.y = s.y - p.h; p.vy = 0; p.ground = true;
    }
  }
  spin = p.ground ? spin * .6 : spin + .22 * p.face;
  for (let i = checkpoints.length - 1; i >= 0; i--) if (p.x > checkpoints[i] + 20) { cp = Math.max(cp, i); break; }
  if (p.y > H + 80) respawn();

  for (const it of items) if (!it.got && Math.abs(p.x + 17 - it.x) < 28 && Math.abs(p.y + 30 - it.y) < 44) { it.got = true; score++; say(it.d[1], 150); pop(`😍`, 40, 60); pop(`+1`, 26, 50, 30); }

  for (const e of enemies) {
    if (e.dead) continue;
    e.x += e.vx; if (e.x < e.min || e.x > e.max) e.vx *= -1;
    if (p.x + p.w > e.x + 3 && p.x < e.x + e.w - 3 && p.y + p.h > e.y && p.y < e.y + e.h) {
      if (p.vy > 1 && prevBottom < e.y + 18) { e.dead = true; p.vy = -9; say(e.d[2], 130); shake = 6; pop(`BONK!`, 30, 45, 0); pop(`😎`, 38, 60, 35); }
      else respawn(`Touché par ` + e.d[1] + ` !`);
    }
  }
  if (!boss.dead) {
    boss.x += boss.vx; if (boss.x < boss.min || boss.x > boss.max) boss.vx *= -1;
    if (boss.flash > 0) boss.flash--;
    if (p.x + p.w > boss.x + 6 && p.x < boss.x + boss.w - 6 && p.y + p.h > boss.y && p.y < boss.y + boss.h) {
      if (p.vy > 1 && prevBottom < boss.y + 28 && boss.flash === 0) {
        boss.hp--; boss.flash = 45; p.vy = -12; boss.vx *= 1.25; shake = 12; pop(`BAM!`, 36, 50, 0); pop(`🔥`, 40, 60, 30);
        if (boss.hp <= 0) { boss.dead = true; say(CONFIG.boss.name + ` est vaincu ! Fonce dans le magasin !`, 220); pop(`🥳`, 50, 80); }
        else say(CONFIG.boss.hit[(CONFIG.boss.hp - boss.hp - 1) % CONFIG.boss.hit.length], 150);
      } else if (boss.flash === 0) respawn(`Le vendeur t'a mis dehors !`);
    }
  }
  if (p.x > 4090) {
    if (boss.dead) { state = `win`; t = 0; const sy = [`👟`,`👟`,`🎉`,`🥾`,`🎂`,`👞`]; for (let i = 0; i < 70; i++) confetti.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*1.5,vy:1+Math.random()*2,c:sy[i % sy.length]}); }
    else { p.x = 4085; say(`Le vendeur bloque la porte ! Écrase-le !`, 120); }
  }
  cam = Math.max(0, Math.min(WORLD - W, p.x - W * .4));
  if (msgT > 0) msgT--;
}

function head(x, y, r, ang) {
  g.save(); g.translate(x, y); g.rotate(ang || 0);
  g.beginPath(); g.arc(0, 0, r, 0, 7); g.closePath(); g.save(); g.clip();
  if (FACE.complete && FACE.naturalWidth) g.drawImage(FACE, -r, -r, r*2, r*2);
  else { g.fillStyle = `#8d5a3b`; g.fillRect(-r, -r, r*2, r*2); }
  g.restore(); g.lineWidth = 4; g.strokeStyle = `#fff`; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
  g.restore();
}
function emoji(ch, x, y, size) { g.font = size + `px serif`; g.textAlign = `center`; g.textBaseline = `middle`; g.fillText(ch, x, y); }
function wrap(text, x, y, maxW, lh) {
  const words = text.split(` `); let line = ``, yy = y;
  for (const w of words) { const test = line + w + ` `; if (g.measureText(test).width > maxW && line) { g.fillText(line, x, yy); line = w + ` `; yy += lh; } else line = test; }
  g.fillText(line, x, yy);
}

function draw() {
  g.fillStyle = `#ffe066`; g.fillRect(0,0,W,H);
  g.fillStyle = `#ff9ecb`; for (let i = 0; i < 8; i++) { const cx = ((i*260 - cam*.25) % (W+260) + W+260) % (W+260) - 100; g.beginPath(); g.arc(cx, 80 + (i%3)*45, 34, 0, 7); g.fill(); }
  g.save();
  if (shake > 0) g.translate((Math.random()-.5)*shake, (Math.random()-.5)*shake);
  g.translate(-cam, 0);
  for (const [x,w] of ground) { g.fillStyle = `#6d4c41`; g.fillRect(x, GY, w, H - GY); g.fillStyle = `#43a047`; g.fillRect(x, GY, w, 12); }
  for (const [x,y,w] of plats) { g.fillStyle = `#8d6e63`; g.fillRect(x, y, w, 14); g.fillStyle = `#66bb6a`; g.fillRect(x, y, w, 5); }
  for (const x of checkpoints.slice(1)) { g.fillStyle = `#fff`; g.fillRect(x + 10, GY - 50, 4, 50); g.fillStyle = `#ff5252`; g.fillRect(x + 14, GY - 50, 22, 14); }
  g.fillStyle = `#e53935`; g.fillRect(4080, GY - 110, 120, 110); g.fillStyle = `#fff`; g.fillRect(4090, GY - 100, 100, 24);
  g.fillStyle = `#e53935`; g.font = `bold 15px system-ui`; g.textAlign = `center`; g.textBaseline = `middle`; g.fillText(`SHOE STORE`, 4140, GY - 88);
  g.fillStyle = `#263238`; g.fillRect(4118, GY - 62, 44, 62); emoji(`👟`, 4140, GY - 80 + 30, 30); emoji(`👟`, 4100, GY - 30, 22); emoji(`👟`, 4180, GY - 30, 22);
  for (const it of items) if (!it.got) emoji(it.d[0], it.x, it.y + Math.sin(t / 15 + it.x) * 4, 32);
  for (const e of enemies) if (!e.dead) emoji(e.d[0], e.x + e.w/2, e.y + e.h/2, 38);
  if (!boss.dead && !(boss.flash > 0 && t % 6 < 3)) { emoji(CONFIG.boss.emoji, boss.x + 40, boss.y + 40, 84); g.fillStyle = `#000`; g.fillRect(boss.x, boss.y - 14, 80, 8); g.fillStyle = `#f44`; g.fillRect(boss.x + 1, boss.y - 13, 78 * boss.hp / CONFIG.boss.hp, 6); }
  const p = player;
  const wob = p.ground && p.vx ? Math.sin(t / 3) * .12 : 0;
  const step = p.vx && p.ground ? Math.sin(t / 3) * 4 : 0;
  g.fillStyle = `#222`; g.fillRect(p.x + 8, p.y + 46, 18, 12);
  emoji(`👟`, p.x + 8, p.y + 60 + step, 20); emoji(`👟`, p.x + 26, p.y + 60 - step, 20);
  head(p.x + 17, p.y + 24, 32, wob + spin);
  for (const f of fx) { g.globalAlpha = Math.min(1, f.life / 20); if (/^[\x20-\x7E]+$/.test(f.txt)) { g.font = `bold ` + f.size + `px Impact, system-ui`; g.textAlign = `center`; g.lineWidth = 5; g.strokeStyle = `#000`; g.strokeText(f.txt, f.x, f.y); g.fillStyle = `#fff200`; g.fillText(f.txt, f.x, f.y); } else emoji(f.txt, f.x, f.y, f.size); g.globalAlpha = 1; }
  g.restore();

  g.fillStyle = `rgba(0,0,0,.55)`; g.fillRect(0, 0, W, 34);
  g.fillStyle = `#fff`; g.font = `bold 16px system-ui`; g.textAlign = `left`; g.textBaseline = `middle`;
  g.fillText(`👟 paires ` + score + `/` + items.length + `   💀 chutes ` + deaths + `   (E = emote)`, 12, 17);
  if (msgT > 0) { g.fillStyle = `rgba(0,0,0,.75)`; g.fillRect(40, 50, W - 80, 54); g.fillStyle = `#fff`; g.font = `bold 18px system-ui`; g.textAlign = `center`; g.textBaseline = `middle`; wrap(msg, W/2, 77, W - 110, 22); }

  if (state === `intro`) {
    g.fillStyle = `rgba(20,0,40,.85)`; g.fillRect(0,0,W,H);
    head(W/2, 115, 70, Math.sin(performance.now()/400) * .15);
    g.fillStyle = `#ffeb3b`; g.textAlign = `center`; g.textBaseline = `middle`; g.font = `bold 36px Impact, system-ui`; g.fillText(CONFIG.title, W/2, 220);
    g.fillStyle = `#fff`; g.font = `19px system-ui`; CONFIG.intro.forEach((l,i) => g.fillText(l, W/2, 266 + i * 28));
    g.font = `15px system-ui`; g.fillStyle = `#b39ddb`; g.fillText(`◀ ▶ bouger  •  ⤒ / Espace sauter  •  😂 emote (E)  •  saute sur les ennemis`, W/2, 368);
    g.fillStyle = `#fff`; g.font = `bold 22px system-ui`; g.fillText(`▶ Touche l'écran pour commencer`, W/2, 408 + Math.sin(performance.now()/300)*3);
  }
  if (state === `win`) {
    g.fillStyle = `rgba(20,0,40,.85)`; g.fillRect(0,0,W,H);
    for (const c of confetti) emoji(c.c, c.x, c.y, 30);
    head(W/2, 105, 70, Math.sin(performance.now()/250) * .25);
    g.textAlign = `center`; g.textBaseline = `middle`; g.fillStyle = `#ffeb3b`; g.font = `bold 40px Impact, system-ui`; g.fillText(`🎉 ` + CONFIG.win[0] + ` 🎉`, W/2, 210);
    g.fillStyle = `#fff`; g.font = `bold 28px system-ui`; g.fillText(CONFIG.name + `, ` + CONFIG.age + ` ans !`, W/2, 256);
    g.font = `19px system-ui`; g.fillText(CONFIG.win[1], W/2, 300); g.fillText(CONFIG.win[2], W/2, 328);
    g.font = `italic 17px system-ui`; g.fillStyle = `#b39ddb`; g.fillText(CONFIG.signature, W/2, 366);
    g.fillStyle = `#fff`; g.font = `16px system-ui`; g.fillText(`(touche pour rejouer)`, W/2, 405);
  }
}
(function loop() { update(); draw(); requestAnimationFrame(loop); })();
