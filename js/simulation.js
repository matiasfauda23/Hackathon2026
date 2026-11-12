// =====================================================================
// 5. SIMULACIÓN DE LA DESTRUCCIÓN
// =====================================================================
let sim = null;                    // datos de la destrucción en curso
const INICIO = 1.4;                // segundos que tarda en girar hacia tu país

function prepararDestruccion(texto, pais) {
  const L = texto.length;
  const nivel = lim(L / 300, 0, 1);  // 0 = "hola", 1 = una consulta larga
  const fracTierra = 0.84 + 0.16 * nivel;
  const fracOceano = 0.30 + 0.70 * nivel;
  const fracAnimales = 0.65 + 0.35 * nivel;
  const expansion = 5.2 - 1.2 * nivel;
  const oLat = pais.lat * RAD, oLon = pais.lon * RAD;
  const sO = Math.sin(oLat), cO = Math.cos(oLat);
  const cOL = Math.cos(oLon), sOL = Math.sin(oLon);

  for (let i = 0; i < N; i++) {
    const cosD = cosLon[i] * cOL + sinLon[i] * sOL;
    const ang = Math.acos(lim(sO * sinLat[i] + cO * cosLat[i] * cosD, -1, 1));
    const afectado = tipo[i] === 0 ? rnd2[i] < fracOceano : rnd2[i] < fracTierra;
    golpe[i] = afectado ? INICIO + (ang / Math.PI) * expansion + rnd[i] * 0.6 + (tipo[i] === 0 ? 0.9 : 0) : Infinity;
  }
  const animales = ANIMALES.map(([emoji, la, lo]) => {
    const cosD = Math.cos(lo * RAD - oLon);
    const ang = Math.acos(lim(sO * Math.sin(la * RAD) + cO * Math.cos(la * RAD) * cosD, -1, 1));
    return { emoji, la, lo, golpe: Math.random() < fracAnimales ? INICIO + (ang / Math.PI) * expansion + 0.3 : Infinity };
  });

  return {
    t: 0, nivel, pais, texto, animales, expansion,
    lava: Math.max(0, nivel - 0.4) * 0.45,
    lunaExplota: nivel > 0.75 ? INICIO + expansion * 0.8 : Infinity,
    fragmentos: null,
    fin: INICIO + expansion + 3.2,
    lonInicio: lon0, latInicio: lat0, terminado: false,
  };
}

// Color de cada punto según cuánto tiempo pasó desde que lo alcanzó la destrucción
function colorDe(i, t) {
  const d = t - golpe[i];
  if (tipo[i] === 1) {
    if (!(d >= 0)) return rnd[i] < 0.5 ? IDX.verde1 : IDX.verde2;
    const duracionFuego = 0.7 + rnd[i] * 1.1;
    if (d < duracionFuego) return [IDX.fuego1, IDX.fuego2, IDX.fuego3][((rnd[i] * 10 + t * 9) | 0) % 3];
    if (d < duracionFuego + 1.0) return IDX.carbon;
    if (sim && rnd2[i] < sim.lava) return ((rnd[i] * 7 + t * 3) | 0) % 2 ? IDX.lava1 : IDX.lava2;
    return rnd[i] < 0.62 ? (rnd[i] < 0.3 ? IDX.arena1 : IDX.arena2) : IDX.carbon;
  }
  if (tipo[i] === 2) {
    if (!(d >= 0)) return IDX.hielo;
    if (d < 1.2) return IDX.derretido;
    return rnd[i] < 0.5 ? IDX.arena2 : IDX.barro;
  }
  if (!(d >= 0)) return -1;               // océano sano: lo pinta el fondo azul
  if (d < 0.8) return IDX.barro;
  return rnd[i] < 0.5 ? IDX.lecho : IDX.arena1;
}
