// =====================================================================
// 2. UTILIDADES
// =====================================================================
const RAD = Math.PI / 180;

function enPoligono(x, y, poly) {
  let dentro = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

// Misma consulta = mismos números
function hashTexto(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function crearAzar(semilla) {
  return function () {
    semilla = (semilla + 0x6D2B79F5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function fmt(n, dec) { return n.toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
const lim = (v, a, b) => Math.max(a, Math.min(b, v));

function detectarPais() {
  const zona = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  for (const [prefijo, nombre, lat, lon] of ZONAS) if (zona.startsWith(prefijo)) return { nombre, lat, lon };
  return { nombre: "Argentina", lat: -34.6, lon: -58.4 };
}

function mezcla(a, b, p) { return a.map((v, i) => Math.round(v + (b[i] - v) * p)); }
