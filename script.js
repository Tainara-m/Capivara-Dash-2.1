// =============================================
//  CAPIVARA DASH  –  script.js  v3.0
// =============================================

// ---------- ASSETS ----------
let personagensImg = {};
let comidaImg, ovoImg, fundoImg;
let coracaoCheio, coracaoVazio;
let fundoPadrao, fundoNoturno, fundoFloresta;
let musicaFundo, musicaFundo2, musicaFundo3;
let somComida, somPerdeVida, somGameOver;

// ---------- ESTADO ----------
let comidinhas = [], ovos = [], vidasDrop = [];
let chaveDrop  = null;
let particulas = [];
let score = 0, displayedScore = 0;
let lives = 3, fase = 1;
let gameStarted = false, jogoPausado = false;
let capivaraX, capivaraY;
let temChave = false, chaveCaiuEssaPartida = false;
let flashFrames = 0;

// ---------- VELOCIDADES ----------
let velocidadeCapivara = 8;
let velocidadeItens    = 1;

// ---------- CONTROLES ----------
let leftPressed = false, rightPressed = false;

// ---------- CONFIG ----------
const MAX_WIDTH  = 560;
const MAX_HEIGHT = 420;
let comidaInterval, ovoInterval, vidaInterval;
let toastTimer = null;

// ---------- PERSONAGEM / DIF / MUSICA ----------
let dificuldadeAtual = 'facil';
let personagemAtual  = 'classica';
let musicaAtual      = 'fundo';
let somMutado        = false;

const PERSONAGENS = {
  classica:   { nome: 'Capivara Clássica',   emoji: '🦫', arquivo: 'assets/classica.png',   aura: [255, 255, 255, 60] },
  ninja:      { nome: 'Capivara Ninja',      emoji: '🥷', arquivo: 'assets/ninja-removebg-preview.png',      aura: [40, 40, 50, 120] },
  princesa:   { nome: 'Capivara Princesa',   emoji: '👑', arquivo: 'assets/princesa-removebg-preview.png',   aura: [255, 160, 215, 110] },
  futebol:    { nome: 'Capivara Futebol',    emoji: '⚽', arquivo: 'assets/futebol-removebg-preview.png',    aura: [90, 210, 90, 110] },
  astronauta: { nome: 'Capivara Astronauta', emoji: '🚀', arquivo: 'assets/astronauta-removebg-preview.png', aura: [170, 210, 255, 110] },
  bailarina:  { nome: 'Capivara Bailarina',  emoji: '🩰', arquivo: 'assets/bailarina-removebg-preview.png',  aura: [255, 175, 215, 110] },
  caipira:   { nome: 'Capivara Caipira',   emoji: '🤠', arquivo: 'assets/caipivara.png',   aura: [220, 180, 90, 110] },
  junino:    { nome: 'Capivara Junina (Menino)', emoji: '👦', arquivo: 'assets/junino.png', aura: [200,140,60,110] },
  junina:    { nome: 'Capivara Junina (Menina)', emoji: '👧', arquivo: 'assets/junina.png', aura: [255,140,180,110] }
};

const DIFICULDADES = {
  facil:   { velBase:1.0, ovoChance:0.22, velCapivara:8, incPorFase:0.12, ovoMs:2400, label:'😊 Fácil'   },
  medio:   { velBase:1.5, ovoChance:0.35, velCapivara:8, incPorFase:0.18, ovoMs:1800, label:'😤 Médio'   },
  dificil: { velBase:2.0, ovoChance:0.50, velCapivara:8, incPorFase:0.25, ovoMs:1400, label:'💀 Difícil' },
};

// =============================================
//  PRELOAD
// =============================================
function preload() {
  // Personagens
  for (let key in PERSONAGENS) {
    personagensImg[key] = loadImage(PERSONAGENS[key].arquivo);
  }
  
  comidaImg    = loadImage('assets/comida.png');
  ovoImg       = loadImage('assets/ovo.png');
  fundoPadrao  = loadImage('assets/fundo.jpeg');
  fundoNoturno = loadImage('assets/fundo_noturno.png');
  fundoFloresta= loadImage('assets/fundo_floresta.png');
  fundoImg     = fundoPadrao;
  coracaoCheio = loadImage('assets/coracaoCheio.png');
  coracaoVazio = loadImage('assets/coracaoVazio.png');
  musicaFundo  = loadSound('assets/fundo.mp3');
  // musicaFundo2 = loadSound('assets/fundo2.mp3'); // ARQUIVO NÃO EXISTE
  // musicaFundo3 = loadSound('assets/fundo3.mp3'); // ARQUIVO NÃO EXISTE
  musicaFundo2 = null; // placeholder
  musicaFundo3 = null; // placeholder
  somComida    = loadSound('assets/comida.mp3');
  somPerdeVida = loadSound('assets/vida.mp3');
  somGameOver  = loadSound('assets/gameover.mp3');
}

// =============================================
//  SETUP / RESIZE
// =============================================
function setup() {
  let canvas = createCanvas(calcW(), calcH());
  canvas.parent('game-canvas');
  // Impede que o p5.js consuma eventos de toque dos botões DOM
  canvas.elt.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: false });
  resetCapivaraPos();
  textFont('Luckiest Guy');
}

function calcW() { return min(windowWidth  - getSidebarW(), MAX_WIDTH);  }
function calcH() { return min(windowHeight - getHudH(),    MAX_HEIGHT); }
function getSidebarW() { return windowWidth >= 760 ? 260 : 0; }
function getHudH()     { return windowWidth < 760 ? 130 : 60; }

function windowResized() {
  resizeCanvas(calcW(), calcH());
  capivaraX = constrain(capivaraX, 0, width - 70);
  capivaraY = height - 70;
}

function resetCapivaraPos() {
  capivaraX = width / 2 - 35;
  capivaraY = height - 70;
}

// =============================================
//  DRAW PRINCIPAL
// =============================================
function draw() {
  if (!gameStarted) return;

  // Fundo
  image(fundoImg, 0, 0, width, height);

  if (jogoPausado) {
    // Redesenha sem mover — corrige bug de acúmulo de itens
    desenharItens();
    desenharParticulas();
    desenharCapivara();
    drawPauseOverlay();
    return;
  }

  // Movimento
  if (leftPressed)  capivaraX = max(0,         capivaraX - velocidadeCapivara);
  if (rightPressed) capivaraX = min(width - 70, capivaraX + velocidadeCapivara);

  // Atualiza tudo
  atualizarComidinhas();
  atualizarOvos();
  atualizarVidasDrop();
  atualizarChave();
  atualizarParticulas();
  updatePlacarAnimado();

  // Desenha
  desenharItens();
  desenharParticulas();
  desenharCapivara();
  drawFlash();
}

// ---------- Desenhar capivara ----------
function desenharCapivara() {
  const personagem = PERSONAGENS[personagemAtual];
  const [r, g, b, a] = personagem.aura;
  
  // Desenha aura (círculo pulsante ao redor)
  push();
  noStroke();
  let auraTam = 90 + sin(frameCount * 0.08) * 8;
  fill(r, g, b, a);
  ellipse(capivaraX + 35, capivaraY + 35, auraTam);
  pop();
  
  // Desenha personagem
  const img = personagensImg[personagemAtual];
  if (img) {
    image(img, capivaraX, capivaraY, 70, 70);
  }
}

// ---------- Desenhar todos os itens ----------
function desenharItens() {
  for (let c of comidinhas)  image(comidaImg,   c.x, c.y, 40, 40);
  for (let o of ovos)        image(ovoImg,       o.x, o.y, 40, 40);

  // Vidas: coração pulsante
  for (let i = 0; i < vidasDrop.length; i++) {
    let v = vidasDrop[i];
    let s = 30 + sin(frameCount * 0.15 + i) * 4;
    image(coracaoCheio, v.x, v.y, s, s);
  }

  // Chave
  if (chaveDrop) {
    push();
    translate(chaveDrop.x + 18, chaveDrop.y + 18);
    rotate(sin(frameCount * 0.07) * 0.28);
    // Halo dourado
    noStroke();
    fill(255, 215, 0, 55 + sin(frameCount * 0.12) * 35);
    ellipse(0, 0, 50, 50);
    textAlign(CENTER, CENTER);
    textSize(26);
    fill(255);
    text('🔑', 0, 2);
    pop();
  }
}

// =============================================
//  COMIDINHAS
// =============================================
function atualizarComidinhas() {
  for (let i = comidinhas.length - 1; i >= 0; i--) {
    let c = comidinhas[i];
    c.y += velocidadeItens;
    if (hit(c.x, c.y, 40, 40)) {
      score += 10;
      particula(c.x+20, c.y+20, '#6eec07', 8);
      comidinhas.splice(i, 1);
      playSom(somComida);
      updateFase();
      updateHUD();
    } else if (c.y > height) {
      lives--;
      comidinhas.splice(i, 1);
      playSom(somPerdeVida);
      flashDano();
      if (lives <= 0) { gameOver(); return; }
      updateHUD();
    }
  }
}

// =============================================
//  OVOS
// =============================================
function atualizarOvos() {
  const cfg = DIFICULDADES[dificuldadeAtual];
  for (let i = ovos.length - 1; i >= 0; i--) {
    let o = ovos[i];
    o.y += velocidadeItens * 1.1; // ovos um pouco mais rápidos
    if (hit(o.x, o.y, 40, 40)) {
      lives--;
      particula(o.x+20, o.y+20, '#ff4444', 7);
      ovos.splice(i, 1);
      playSom(somPerdeVida);
      flashDano();
      if (lives <= 0) { gameOver(); return; }
      updateHUD();
    } else if (o.y > height) {
      ovos.splice(i, 1);
    }
  }
}

// =============================================
//  VIDAS DROP
// =============================================
function atualizarVidasDrop() {
  for (let i = vidasDrop.length - 1; i >= 0; i--) {
    let v = vidasDrop[i];
    v.y += velocidadeItens * 0.65;
    if (hit(v.x, v.y, 32, 32)) {
      if (lives < 3) { lives++; showToast('❤️ Vida recuperada!'); playSom(somComida); updateHUD(); }
      particula(v.x+15, v.y+15, '#ff69b4', 10);
      vidasDrop.splice(i, 1);
    } else if (v.y > height) {
      vidasDrop.splice(i, 1);
    }
  }
}

// =============================================
//  CHAVE
// =============================================
function atualizarChave() {
  if (!chaveDrop) return;
  chaveDrop.y += velocidadeItens * 0.55;
  if (hit(chaveDrop.x, chaveDrop.y, 36, 36)) {
    temChave = true;
    chaveDrop = null;
    showToast('🔑 Chave coletada! Você pode reviver uma vez!');
    particula(capivaraX+35, capivaraY+20, '#ffd700', 16);
    updateHUD();
    return;
  }
  if (chaveDrop && chaveDrop.y > height) chaveDrop = null;
}

// =============================================
//  PARTÍCULAS
// =============================================
function particula(px, py, cor, qtd) {
  for (let i = 0; i < qtd; i++) {
    particulas.push({
      x: px, y: py,
      vx: random(-3.5, 3.5),
      vy: random(-4.5, -0.5),
      vida: 1.0,
      tam: random(4, 11),
      cor: cor,
    });
  }
}

function atualizarParticulas() {
  for (let i = particulas.length - 1; i >= 0; i--) {
    let p = particulas[i];
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += 0.18;
    p.vida -= 0.045;
    if (p.vida <= 0) particulas.splice(i, 1);
  }
}

function desenharParticulas() {
  noStroke();
  for (let p of particulas) {
    let c = color(p.cor);
    c.setAlpha(p.vida * 255);
    fill(c);
    ellipse(p.x, p.y, p.tam * p.vida);
  }
}

// =============================================
//  COLISÃO / HELPERS
// =============================================
function hit(x2, y2, w2, h2) {
  return capivaraX < x2+w2 && capivaraX+70 > x2 &&
         capivaraY < y2+h2 && capivaraY+70 > y2;
}

function collideRectRect(x1,y1,w1,h1,x2,y2,w2,h2) {
  return x1<x2+w2 && x1+w1>x2 && y1<y2+h2 && y1+h1>y2;
}

function podeNascer(xNovo, fila, minDist) {
  return !fila.some(item => Math.abs(item.x - xNovo) < minDist);
}

function playSom(s) {
  try { if (s) s.play(); } catch(e) {}
}

// =============================================
//  FLASH DE DANO
// =============================================
function flashDano() { flashFrames = 10; }

function drawFlash() {
  if (flashFrames > 0) {
    noStroke();
    fill(255, 0, 0, map(flashFrames, 0, 10, 0, 130));
    rect(0, 0, width, height);
    flashFrames--;
  }
}

// =============================================
//  PAUSE OVERLAY
// =============================================
function drawPauseOverlay() {
  fill(0, 0, 0, 130);
  noStroke();
  rect(0, 0, width, height);
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(38);
  text('⏸ PAUSADO', width/2, height/2 - 22);
  textSize(16);
  text('Pressione P para continuar', width/2, height/2 + 22);
}

// =============================================
//  PLACAR ANIMADO
// =============================================
function updatePlacarAnimado() {
  if (displayedScore < score) {
    displayedScore = min(displayedScore + 3, score);
  }
}

// =============================================
//  UPDATE FASE
// =============================================
function updateFase() {
  let novaFase = Math.floor(score / 100);
  if (novaFase <= fase) return;
  fase = novaFase;

  const inc = DIFICULDADES[dificuldadeAtual].incPorFase;
  velocidadeItens    = min(velocidadeItens + inc, 6);
  velocidadeCapivara = min(velocidadeCapivara + 0.25, 14);

  mostrarOverlapFase(fase);

  // Chave: cai 1× por partida após fase 5
  if (fase >= 5 && !chaveCaiuEssaPartida && !temChave) {
    chaveCaiuEssaPartida = true;
    setTimeout(() => {
      if (gameStarted && !chaveDrop) {
        chaveDrop = { x: random(20, width - 60), y: -30 };
        showToast('🔑 Uma chave apareceu! Pegue para reviver!');
      }
    }, 1500);
  }
}

// =============================================
//  OVERLAY DE FASE
// =============================================
const FASE_EMOJIS = ['🌟','🚀','⚡','🔥','💥','🌈','👑','🎯','💫','🌀'];
const FASE_SUBS   = [
  'Ficou mais rápido!','Cuidado com os ovos!','Vai fundo!',
  'Incrível!','Imparável!','Lendário!','Máxima velocidade!',
  'Você é demais!','Histórico!','IMPOSSÍVEL!',
];

function mostrarOverlapFase(numFase) {
  const overlay = document.getElementById('fase-overlay');
  const emojiEl = document.getElementById('fase-overlay-emoji');
  const numEl   = document.getElementById('fase-overlay-num');
  const subEl   = document.getElementById('fase-overlay-sub');
  if (!overlay) return;

  const idx = Math.min(numFase - 2, FASE_EMOJIS.length - 1);
  emojiEl.textContent = FASE_EMOJIS[Math.max(0,idx)];
  numEl.textContent   = numFase;
  subEl.textContent   = FASE_SUBS[Math.max(0,idx)];

  overlay.style.display = 'flex';
  overlay.classList.remove('fase-hide');
  overlay.classList.add('fase-show');

  setTimeout(() => {
    overlay.classList.replace('fase-show','fase-hide');
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.classList.remove('fase-hide');
    }, 300);
  }, 900);
}

// =============================================
//  TOAST
// =============================================
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => { el.style.display = 'none'; }, 380);
  }, 2200);
}

// =============================================
//  HUD
// =============================================
function updateHUD() {
  const best = Number(localStorage.getItem('bestScore') || 0);
  setTxt('hud-score',      score);
  setTxt('hud-fase',       fase);
  setTxt('hud-best',       best);
  setTxt('hud-score-side', score);
  setTxt('hud-fase-side',  fase);
  setTxt('hud-best-side',  best);
  renderVidasHTML();
  updateFaseBar();
  updateChaveIndicator();
}

function setTxt(id, v) {
  const el = document.getElementById(id);
  if (el) el.innerText = v;
}

function renderVidasHTML() {
  const el = document.getElementById('vidas-html');
  if (!el) return;
  let h = '';
  for (let i = 0; i < 3; i++) {
    h += i < lives
      ? '<span class="vida-icon vida-on">❤️</span>'
      : '<span class="vida-icon vida-off">🖤</span>';
  }
  if (temChave) h += '<span class="vida-icon chave-hud" title="Reviver disponível">🔑</span>';
  el.innerHTML = h;
}

function updateFaseBar() {
  const bar = document.getElementById('fase-bar-fill');
  if (bar) bar.style.width = ((score % 100) / 100 * 100) + '%';
}

function updateChaveIndicator() {
  const el = document.getElementById('chave-indicator');
  if (el) el.style.display = temChave ? 'flex' : 'none';
}

// =============================================
//  TECLADO
// =============================================
function keyPressed() {
  if (keyCode === LEFT_ARROW)  leftPressed  = true;
  if (keyCode === RIGHT_ARROW) rightPressed = true;
  if (key === 'p' || key === 'P') togglePause();
  if (key === 'm' || key === 'M') toggleMute();
}
function keyReleased() {
  if (keyCode === LEFT_ARROW)  leftPressed  = false;
  if (keyCode === RIGHT_ARROW) rightPressed = false;
}

// p5.js chama preventDefault em touchstart globalmente — retornar true desativa isso
function touchStarted() { return true; }
function touchEnded()   { return true; }

function mousePressed() {}
function mouseReleased() {}

// =============================================
//  SOM
// =============================================
function getMusicaObj() {
  if (musicaAtual === 'fundo2' && musicaFundo2) return musicaFundo2;
  if (musicaAtual === 'fundo3' && musicaFundo3) return musicaFundo3;
  return musicaFundo;
}

function stopTodasMusicas() {
  [musicaFundo, musicaFundo2, musicaFundo3].forEach(m => {
    try { if (m && m.isPlaying()) m.stop(); } catch(e) {}
  });
}

function toggleMute() {
  somMutado = !somMutado;
  somMutado ? getAudioContext().suspend() : getAudioContext().resume();
  atualizarIconesMute();
}

function toggleMuteStart() {
  somMutado = !somMutado;
  somMutado ? getAudioContext().suspend() : getAudioContext().resume();
  const btn = document.getElementById('mute-start-btn');
  if (btn) btn.textContent = somMutado ? '🔇 Mutado' : '🔊 Som';
  atualizarIconesMute();
}

function atualizarIconesMute() {
  const on  = 'fa-solid fa-volume-high';
  const off = 'fa-solid fa-volume-xmark';
  const cls = somMutado ? off : on;
  ['mute-icon','mute-icon-side','touch-mute-icon'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = cls;
  });
  const btn = document.getElementById('mute-button');
  if (btn) btn.title = somMutado ? 'Ligar som' : 'Desligar som';
}

function selecionarMusica(m) {
  musicaAtual = m;
  document.querySelectorAll('.music-btn:not(.mute-toggle)').forEach(b => {
    b.classList.toggle('active', b.dataset.music === m);
  });
  if (gameStarted) { stopTodasMusicas(); try { getMusicaObj().loop(); } catch(e){} }
}

// =============================================
//  PAUSE  (bug corrigido: sem noLoop)
// =============================================
function handlePauseToggle() { togglePause(); }

function togglePause() {
  if (!gameStarted) return;
  jogoPausado = !jogoPausado;

  // Atualiza todos os botões de pause
  const status = document.getElementById('pause-status');
  const toggle = document.getElementById('pause-toggle');
  const pIcon  = document.getElementById('touch-pause-icon');
  const hudIcon= document.getElementById('hud-pause-icon');

  if (jogoPausado) {
    if (status)  status.innerText = 'Pausado';
    if (toggle)  toggle.checked   = true;
    if (pIcon)   pIcon.className  = 'fa-solid fa-play';
    if (hudIcon) hudIcon.className = 'fa-solid fa-play';
  } else {
    if (status)  status.innerText = 'Jogando';
    if (toggle)  toggle.checked   = false;
    if (pIcon)   pIcon.className  = 'fa-solid fa-pause';
    if (hudIcon) hudIcon.className = 'fa-solid fa-pause';
  }
}

// =============================================
//  SELEÇÃO DE DIF / PERSONAGEM
// =============================================
function selecionarDificuldade(dif) {
  dificuldadeAtual = dif;
  document.querySelectorAll('.dif-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.dif === dif);
  });
}

function selecionarPersonagem(char) {
  if (PERSONAGENS[char]) {
    personagemAtual = char;
    document.querySelectorAll('.char-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.char === char);
    });
  }
}

// =============================================
//  TEMAS
// =============================================
function trocarTema() {
  const tema   = document.getElementById('tema')?.value || 'padrao';
  const hud    = document.getElementById('right-bar');
  const left   = document.getElementById('left-bar');
  const hudTop = document.getElementById('game-header');

  const temas = {
    padrao:   {
      fundo: fundoPadrao, bg:'#fd7a00',
      hud:'rgba(255,255,255,0.75)', hudC:'#003366', hudBorder:'rgba(0,100,200,0.4)',
      left:'rgba(230,247,255,0.6)', leftC:'#003366', top:'rgba(0,0,0,0.35)',
    },
    noturno:  {
      fundo: fundoNoturno, bg:'#0d0d1a',
      hud:'rgba(20,20,40,0.88)', hudC:'#fff', hudBorder:'rgba(100,100,255,0.4)',
      left:'rgba(20,20,40,0.6)', leftC:'#aaa', top:'rgba(10,10,30,0.6)',
    },
    floresta: {
      fundo: fundoFloresta, bg:'#1a3a1a',
      hud:'rgba(7,80,7,0.75)', hudC:'#d4ffd4', hudBorder:'rgba(7,180,7,0.5)',
      left:'rgba(210,245,210,0.5)', leftC:'#145c1b', top:'rgba(0,40,0,0.5)',
    },
  };

  const t = temas[tema] || temas.padrao;
  if (t.fundo) fundoImg = t.fundo;
  document.body.style.background = t.bg;
  if (hud)    { hud.style.background = t.hud; hud.style.color = t.hudC; hud.style.borderColor = t.hudBorder; }
  if (left)   { left.style.background = t.left; left.style.color = t.leftC; }
  if (hudTop) { hudTop.style.background = t.top; }
}

// =============================================
//  START GAME
// =============================================
function startGame() {
  document.body.classList.replace('inicio','jogo');
  document.getElementById('start-screen').style.display    = 'none';
  document.getElementById('game-ui').style.display         = 'flex';
  document.getElementById('game-over-popup').style.display = 'none';

  setTimeout(() => {
    document.getElementById('game-ui').classList.add('ui-visible');
  }, 40);

  // Música
  stopTodasMusicas();
  try { getMusicaObj().loop(); } catch(e) { try { musicaFundo.loop(); } catch(ee){} }

  // Estado
  gameStarted = true;
  jogoPausado = false;
  score = 0; displayedScore = 0;
  lives = 3; fase = 0;
  temChave = false; chaveCaiuEssaPartida = false; chaveDrop = null;
  particulas = []; flashFrames = 0;
  leftPressed = false; rightPressed = false;
  
  // Aplicar tema quando o jogo começa
  trocarTema();

  const cfg = DIFICULDADES[dificuldadeAtual];
  velocidadeItens    = cfg.velBase;
  velocidadeCapivara = cfg.velCapivara;

  comidinhas = []; ovos = []; vidasDrop = [];
  resetCapivaraPos();

  // Reset pause UI
  setTxt('pause-status','Jogando');
  const toggle = document.getElementById('pause-toggle');
  if (toggle) toggle.checked = false;
  const hudIcon = document.getElementById('hud-pause-icon');
  if (hudIcon) hudIcon.className = 'fa-solid fa-pause';

  // Intervalos (bug fix: não gera itens durante pause)
  clearInterval(comidaInterval);
  clearInterval(ovoInterval);
  clearInterval(vidaInterval);

  comidaInterval = setInterval(() => {
    if (jogoPausado || !gameStarted) return;
    let x = random(10, width - 50);
    if (podeNascer(x, comidinhas, 90) && podeNascer(x, ovos, 90) && random() < 0.55)
      comidinhas.push({ x, y: -random(30, 100) });
  }, 1100);

  ovoInterval = setInterval(() => {
    if (jogoPausado || !gameStarted) return;
    let x = random(10, width - 50);
    if (podeNascer(x, ovos, 90) && podeNascer(x, comidinhas, 90) && random() < cfg.ovoChance)
      ovos.push({ x, y: -random(30, 100) });
  }, cfg.ovoMs);

  vidaInterval = setInterval(() => {
    if (jogoPausado || !gameStarted) return;
    if (random() < 0.18)
      vidasDrop.push({ x: random(10, width - 50), y: -random(30, 100) });
  }, 18000);

  loop();
  updateHUD();
  trocarTema();
}

function restartGame() { startGame(); }

// =============================================
//  GAME OVER / REVIVER
// =============================================
function gameOver() {
  if (temChave) {
    temChave = false;
    lives = 1;
    flashFrames = 18;
    showToast('🔑 Chave usada! Capivara reviveu!');
    particula(capivaraX+35, capivaraY, '#ffd700', 20);
    updateHUD();
    return;
  }

  noLoop();
  gameStarted = false;
  jogoPausado = false;
  clearInterval(comidaInterval);
  clearInterval(ovoInterval);
  clearInterval(vidaInterval);
  comidinhas = []; ovos = []; vidasDrop = []; chaveDrop = null;
  leftPressed = false; rightPressed = false;
  resetCapivaraPos();

  stopTodasMusicas();
  playSom(somGameOver);

  let best = Number(localStorage.getItem('bestScore') || 0);
  const novoRec = score > best;
  if (novoRec) { best = score; localStorage.setItem('bestScore', best); }

  updateHUD();
  setTxt('final-score', score);
  setTxt('final-best',  best);

  const badge = document.getElementById('new-record-badge');
  if (badge) badge.style.display = novoRec ? 'block' : 'none';

  const difEl = document.getElementById('gameover-dif');
  if (difEl) difEl.textContent = 'Dificuldade: ' + DIFICULDADES[dificuldadeAtual].label;

  document.getElementById('game-over-popup').style.display = 'flex';
}

// =============================================
//  VOLTAR AO MENU
// =============================================
function salvarJogo() {
  const tema = document.getElementById('tema')?.value || 'padrao';
  const jogoSalvo = {
    score,
    lives,
    fase,
    dificuldade: dificuldadeAtual,
    personagem: personagemAtual,
    musica: musicaAtual,
    tema,
    temChave,
    chaveCaiuEssaPartida,
    salvoEm: Date.now()
  };
  localStorage.setItem('capivaraDashSavedGame', JSON.stringify(jogoSalvo));
}

function salvarEVoltar() {
  salvarJogo();
  showToast('💾 Jogo salvo! Voltando ao menu...');
  voltarParaInicio();
}

function voltarParaInicio() {
  gameStarted = false;
  document.body.classList.replace('jogo','inicio');
  document.getElementById('start-screen').style.display    = 'flex';
  document.getElementById('game-ui').style.display         = 'none';
  document.getElementById('game-over-popup').style.display = 'none';
  document.getElementById('game-ui').classList.remove('ui-visible');

  // Mostra recorde na tela inicial
  const best = Number(localStorage.getItem('bestScore') || 0);
  setTxt('start-best-val', best);
}

// =============================================
//  INIT
// =============================================
function initCustomSelect() {
  const selectRoot = document.getElementById('tema-select');
  if (!selectRoot) return;

  const trigger = selectRoot.querySelector('.select-trigger');
  const valueLabel = trigger.querySelector('.selected-value');
  const options = selectRoot.querySelectorAll('.select-option');

  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.id = 'tema';
  hiddenInput.value = 'padrao';
  selectRoot.appendChild(hiddenInput);

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    selectRoot.classList.toggle('open');
  });

  options.forEach(option => {
    option.addEventListener('click', () => {
      options.forEach(opt => opt.classList.toggle('active', opt === option));
      valueLabel.textContent = option.textContent;
      hiddenInput.value = option.dataset.value || 'padrao';
      selectRoot.classList.remove('open');
      trocarTema();
    });
  });

  document.addEventListener('click', (event) => {
    if (!selectRoot.contains(event.target)) {
      selectRoot.classList.remove('open');
    }
  });
}

function setupTouchBtn(id, onStart, onEnd) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); onStart(); }, { passive: false });
  btn.addEventListener('touchend',   (e) => { e.preventDefault(); onEnd();   }, { passive: false });
  btn.addEventListener('touchcancel',(e) => { e.preventDefault(); onEnd();   }, { passive: false });
  btn.addEventListener('mousedown',  () => onStart());
  btn.addEventListener('mouseup',    () => onEnd());
  btn.addEventListener('mouseleave', () => onEnd());
}

window.onload = () => {
  initCustomSelect();
  trocarTema();
  const best = Number(localStorage.getItem('bestScore') || 0);
  setTxt('start-best-val', best);
  
  // Setup event listeners para botões touch
  setupTouchBtn('btn-left',
    () => { leftPressed = true; },
    () => { leftPressed = false; }
  );
  setupTouchBtn('btn-right',
    () => { rightPressed = true; },
    () => { rightPressed = false; }
  );
};

window.addEventListener('resize', () => {
  if (gameStarted) windowResized();
});