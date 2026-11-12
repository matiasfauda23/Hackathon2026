// =====================================================================
// 6. GLOBO 3D (canvas)
// =====================================================================
const canvas = document.getElementById("globo");
const ctx = canvas.getContext("2d");
let TAM, R, CX, CY;
function redimensionar() {
  const dpr = window.devicePixelRatio || 1;
  TAM = canvas.clientWidth * dpr;
  canvas.width = canvas.height = TAM;
  R = TAM * 0.36; CX = TAM / 2; CY = TAM * 0.53;
}
window.addEventListener("resize", redimensionar);
redimensionar();
let lon0 = -60, lat0 = 8;          // hacia dónde mira la cámara
let particulas = [];
let fragmentosLuna = null;
let ultimo = performance.now();
const estad = { tierra: 0, oceano: 0, focos: 0, animales: 0 };   // lo destruido hasta ahora

function dibujar(ahora) {
  const dt = Math.min(0.05, (ahora - ultimo) / 1000);
  ultimo = ahora;
  const t = (reloj += dt);
  const tSim = sim ? t - sim.t0 : 0;

  // --- cámara: gira sola, o viaja hacia el objetivo cuando consultás ---
  if (sim && tSim < INICIO) {
    const p = tSim / INICIO, e = p * p * (3 - 2 * p);
    const dLon = ((sim.objetivo.lon - sim.lonInicio + 540) % 360) - 180;
    lon0 = sim.lonInicio + dLon * e;
    lat0 = sim.latInicio + (sim.objetivo.lat * 0.8 - sim.latInicio) * e;
  } else {
    const quieta = sim && !sim.terminado && ["provincia", "pais", "continente"].includes(sim.nivel.id);
    lon0 += dt * (quieta ? 0 : sim && !sim.terminado ? 16 : 9);
  }

  // daño total del planeta (0 = intacto, 1 = destruido), según lo que ya se destruyó
  const prog = 1 - calcularSalud() / 100;

  ctx.clearRect(0, 0, TAM, TAM);

  // --- atmósfera ---
  const atm = mezcla([150, 235, 255], [140, 80, 40], prog);
  let g = ctx.createRadialGradient(CX, CY, R * 0.95, CX, CY, R * 1.18);
  g.addColorStop(0, `rgba(${atm},0.65)`); g.addColorStop(1, `rgba(${atm},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, R * 1.18, 0, Math.PI * 2); ctx.fill();

  // --- océano (esfera de fondo) ---
  const mar = mezcla([28, 112, 186], [92, 80, 58], estad.oceano / TOTAL_OCEANO);
  g = ctx.createRadialGradient(CX - R * 0.35, CY - R * 0.4, R * 0.1, CX, CY, R);
  g.addColorStop(0, `rgb(${mezcla(mar, [255, 255, 255], 0.25)})`); g.addColorStop(1, `rgb(${mezcla(mar, [0, 0, 0], 0.45)})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.fill();

  // --- proyección ortográfica de todos los puntos ---
  const sl0 = Math.sin(lat0 * RAD), cl0 = Math.cos(lat0 * RAD);
  const s0 = Math.sin(lon0 * RAD), c0 = Math.cos(lon0 * RAD);
  const lado = PASO * RAD * R * 1.18;
  const LX = -0.45, LY = 0.55, LZ = 0.7;
  for (const b of BALDES) b.length = 0;
  let focos = 0, tierra = 0, oceano = 0;

  for (let i = 0; i < N; i++) {
    const cosd = cosLon[i] * c0 + sinLon[i] * s0;
    const sind = sinLon[i] * c0 - cosLon[i] * s0;
    const z = sl0 * sinLat[i] + cl0 * cosLat[i] * cosd;
    pantZ[i] = z;
    const c = colorDe(i, t);
    if (c >= IDX.fuego1 && c <= IDX.fuego3) focos++;
    if (golpe[i] <= t) tipo[i] === 0 ? oceano++ : tierra++;
    if (z <= 0) continue;
    const x = cosLat[i] * sind, y = cl0 * sinLat[i] - sl0 * cosLat[i] * cosd;
    const X = CX + R * x, Y = CY - R * y;
    pantX[i] = X; pantY[i] = Y;
    if (c < 0) continue;
    const luz = EMISIVOS.has(c) ? 7 : Math.round(lim((0.25 + Math.max(0, x * LX + y * LY + z * LZ)) / 1.25, 0, 1) * 7);
    BALDES[c * 8 + luz].push(X, Y);

    // chispas y humo que salen de los incendios
    if (c >= IDX.fuego1 && c <= IDX.fuego3 && Math.random() < 0.02 && particulas.length < 700)
      particulas.push({ x: X, y: Y, vx: (Math.random() - 0.5) * 0.4, vy: -(0.4 + Math.random()) * R / 240, vida: 0, max: 1 + Math.random() * 1.5 });
  }
  for (let b = 0; b < BALDES.length; b++) {
    const arr = BALDES[b];
    if (!arr.length) continue;
    ctx.fillStyle = ESTILOS[b];
    for (let j = 0; j < arr.length; j += 2) ctx.fillRect(arr[j] - lado / 2, arr[j + 1] - lado / 2, lado, lado);
  }

  // --- árboles ---
  const esc = R / 240;
  for (const i of ARBOLES) {
    if (pantZ[i] < 0.2) continue;
    const d = t - golpe[i], X = pantX[i], Y = pantY[i], s = esc * (0.55 + 0.45 * pantZ[i]);
    const duracionFuego = 0.7 + rnd[i] * 1.1;
    if (!(d >= 0) || d < duracionFuego) {
      const quemando = d >= 0;
      ctx.fillStyle = "#5a3d22"; ctx.fillRect(X - 1.2 * s, Y - 2 * s, 2.4 * s, 5 * s);
      ctx.fillStyle = quemando ? (((t * 10 + rnd[i] * 5) | 0) % 2 ? "#ff7a1a" : "#ffc233") : (rnd[i] < 0.045 ? "#1d6b2c" : "#25803a");
      ctx.beginPath(); ctx.moveTo(X, Y - 13 * s); ctx.lineTo(X - 5 * s, Y - 1 * s); ctx.lineTo(X + 5 * s, Y - 1 * s); ctx.fill();
    } else if (d < duracionFuego + 2.5) {
      ctx.fillStyle = "#1c1410"; ctx.fillRect(X - 1.2 * s, Y - 1 * s, 2.4 * s, 3 * s); // tronco quemado
    }
  }

  // --- sombreado 3D (bordes más oscuros) ---
  g = ctx.createRadialGradient(CX - R * 0.3, CY - R * 0.35, R * 0.2, CX, CY, R * 1.02);
  g.addColorStop(0, "rgba(255,255,255,0.10)"); g.addColorStop(0.65, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.fill();
  if (prog > 0) { // smog
    ctx.fillStyle = `rgba(90,60,35,${0.18 * prog})`; ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.fill();
  }

  // --- animales ---
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  let extintos = 0;
  for (let n = 0; n < ANIMALES.length; n++) {
    const a = { emoji: ANIMALES[n][0], la: ANIMALES[n][1], lo: ANIMALES[n][2] };
    const d = t - golpeAnimal[n];
    if (d >= 0) extintos++;
    const la = a.la * RAD, dl = (a.lo - lon0) * RAD;
    const z = sl0 * Math.sin(la) + cl0 * Math.cos(la) * Math.cos(dl);
    if (z < 0.25) continue;
    const X = CX + R * Math.cos(la) * Math.sin(dl);
    const Y = CY - R * (cl0 * Math.sin(la) - sl0 * Math.cos(la) * Math.cos(dl));
    let emoji = a.emoji, alfa = 1;
    if (d >= 0 && d < 1.0) emoji = "🔥";
    else if (d >= 1.0) { emoji = "💀"; alfa = lim(1 - (d - 1.0) / 2.5, 0, 1); }
    if (alfa <= 0) continue;
    ctx.globalAlpha = alfa;
    ctx.font = `${Math.round(17 * esc * (0.6 + 0.4 * z))}px sans-serif`;
    ctx.fillText(emoji, X, Y);
    ctx.globalAlpha = 1;
  }

  // --- partículas de fuego y humo ---
  particulas = particulas.filter(p => (p.vida += dt) < p.max);
  for (const p of particulas) {
    p.x += p.vx; p.y += p.vy;
    const f = p.vida / p.max;
    ctx.fillStyle = f < 0.3 ? `rgba(255,${140 - f * 200 | 0},30,${0.9 - f})` : `rgba(70,60,55,${0.5 * (1 - f)})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, (2 + f * 7) * esc, 0, Math.PI * 2); ctx.fill();
  }

  // --- cartel con el nombre del objetivo ---
  if (sim && !sim.terminado && tSim > INICIO * 0.6) dibujarCartel(sim.objetivo, sl0, cl0, esc);

  // --- la Luna (solo explota con consultas largas) ---
  dibujarLuna(t, dt);

  estad.tierra = tierra; estad.oceano = oceano; estad.focos = focos; estad.animales = extintos;
  actualizarPanel(tSim);
  // Marca roja + nombre del lugar que se está destruyendo
function dibujarCartel(obj, sl0, cl0, esc) {
  const la = obj.lat * RAD, dl = (obj.lon - lon0) * RAD;
  const z = sl0 * Math.sin(la) + cl0 * Math.cos(la) * Math.cos(dl);
  let X = CX + R * Math.cos(la) * Math.sin(dl);
  let Y = CY - R * (cl0 * Math.sin(la) - sl0 * Math.cos(la) * Math.cos(dl));
  if (z < 0.1 || obj.nombre === "el planeta Tierra") { X = CX; Y = CY - R * 1.08; }
  else {
    ctx.fillStyle = "#e3261b"; ctx.beginPath(); ctx.arc(X, Y, 5 * esc, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#e3261b"; ctx.lineWidth = 2 * esc; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X, Y - 26 * esc); ctx.stroke();
    Y -= 36 * esc;
  }
  const texto = "Destruyendo " + obj.nombre;
  ctx.font = `bold ${Math.round(15 * esc)}px "Segoe UI", sans-serif`;
  const ancho = ctx.measureText(texto).width + 16 * esc;
  ctx.fillStyle = "rgba(20,10,5,.82)";
  ctx.fillRect(X - ancho / 2, Y - 13 * esc, ancho, 26 * esc);
  ctx.fillStyle = "#ffd5b0"; ctx.fillText(texto, X, Y);
}

requestAnimationFrame(dibujar);
}

function dibujarLuna(t, dt) {
  const lx = CX + R * 1.12, ly = CY - R * 1.14, lr = R * 0.12;
  if (t < lunaExplota) {
    const g = ctx.createRadialGradient(lx - lr * 0.4, ly - lr * 0.4, lr * 0.1, lx, ly, lr);
    g.addColorStop(0, "#f4f4f0"); g.addColorStop(1, "#9a9a94");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(120,120,115,.5)";
    [[-0.3, -0.1, 0.22], [0.35, 0.3, 0.15], [0.1, -0.45, 0.12]].forEach(([a, b, r]) => {
      ctx.beginPath(); ctx.arc(lx + a * lr, ly + b * lr, r * lr, 0, Math.PI * 2); ctx.fill();
    });
    return;
  }
  if (!fragmentosLuna) {
    fragmentosLuna = Array.from({ length: 9 }, () => ({ x: lx, y: ly, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, r: lr * (0.2 + Math.random() * 0.3), rot: Math.random() * 6 }));
  }
  const d = t - lunaExplota;
  if (d < 0.6) { // destello
    ctx.fillStyle = `rgba(255,200,80,${1 - d / 0.6})`;
    ctx.beginPath(); ctx.arc(lx, ly, lr * (1 + d * 5), 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "#a8a8a0";
  for (const f of fragmentosLuna) {
    f.x += f.vx * dt * 30 * 0.3; f.y += f.vy * dt * 30 * 0.3; f.rot += dt * 2;
    ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
    ctx.fillRect(-f.r / 2, -f.r / 2, f.r, f.r * 0.7); ctx.restore();
  }
}

// Marca roja + nombre del lugar que se está destruyendo
function dibujarCartel(obj, sl0, cl0, esc) {
  const la = obj.lat * RAD, dl = (obj.lon - lon0) * RAD;
  const z = sl0 * Math.sin(la) + cl0 * Math.cos(la) * Math.cos(dl);
  let X = CX + R * Math.cos(la) * Math.sin(dl);
  let Y = CY - R * (cl0 * Math.sin(la) - sl0 * Math.cos(la) * Math.cos(dl));
  if (z < 0.1 || obj.nombre === "el planeta Tierra") { X = CX; Y = CY - R * 1.08; }
  else {
    ctx.fillStyle = "#e3261b"; ctx.beginPath(); ctx.arc(X, Y, 5 * esc, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#e3261b"; ctx.lineWidth = 2 * esc; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X, Y - 26 * esc); ctx.stroke();
    Y -= 36 * esc;
  }
  const texto = "Destruyendo " + obj.nombre;
  ctx.font = `bold ${Math.round(15 * esc)}px "Segoe UI", sans-serif`;
  const ancho = ctx.measureText(texto).width + 16 * esc;
  ctx.fillStyle = "rgba(20,10,5,.82)";
  ctx.fillRect(X - ancho / 2, Y - 13 * esc, ancho, 26 * esc);
  ctx.fillStyle = "#ffd5b0"; ctx.fillText(texto, X, Y);
}

requestAnimationFrame(dibujar);
