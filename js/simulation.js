// =====================================================================
// 5. SIMULACIÓN DE LA DESTRUCCIÓN
// =====================================================================
let sim = null;                    // consulta en curso
let reloj = 0;                     // segundos desde que se abrió la página
let lavaFrac = 0;                  // porción de tierra que se vuelve lava
let lunaExplota = Infinity;        // momento en que explota la Luna
let provinciasDestruidas = [];
const golpeAnimal = new Float32Array(ANIMALES.length).fill(Infinity);
const INICIO = 1.4;                // segundos que tarda la cámara en llegar al objetivo

function contarPalabras(texto) { return texto.trim().split(/\s+/).filter(Boolean).length; }

function nivelDe(palabras) {
  let nivel = NIVELES[0];
  for (const n of NIVELES) if (palabras >= n.min) nivel = n;
  return nivel;
}

// La primera provincia siempre es Tucumán; después, una al azar que siga en pie
function elegirProvincia() {
  if (!provinciasDestruidas.length) return PROVINCIAS[0];
  const quedan = PROVINCIAS.filter(p => !provinciasDestruidas.includes(p.nombre));
  const lista = quedan.length ? quedan : PROVINCIAS;
  return lista[Math.floor(Math.random() * lista.length)];
}

// Distancia angular (en radianes) entre un punto de la grilla y un lugar
function distancia(i, lat, lon) {
  const cosD = Math.cos((lonDeg[i] - lon) * RAD);
  return Math.acos(lim(Math.sin(lat * RAD) * sinLat[i] + Math.cos(lat * RAD) * cosLat[i] * cosD, -1, 1));
}

// Define qué se destruye: el nombre, hacia dónde mira la cámara y qué puntos entran
function definirObjetivo(nivel) {
  switch (nivel.id) {
    case "provincia": {
      const p = elegirProvincia();
      provinciasDestruidas.push(p.nombre);
      return { nombre: p.nombre, lat: p.lat, lon: p.lon, expansion: 1.2,
               dentro: i => distancia(i, p.lat, p.lon) < 2.8 * RAD,
               dentroAnimal: (la, lo) => Math.abs(la - p.lat) < 3 && Math.abs(lo - p.lon) < 3 };
    }
    case "pais":
      return { nombre: "Argentina", lat: -36, lon: -64, expansion: 2.5,
               dentro: i => tipo[i] !== 0 && enPoligono(lonDeg[i], latDeg[i], ARGENTINA),
               dentroAnimal: (la, lo) => enPoligono(lo, la, ARGENTINA) };
    case "continente":
      return { nombre: "América", lat: -5, lon: -75, expansion: 3.5,
               dentro: i => tipo[i] !== 0 && lonDeg[i] < -25,
               dentroAnimal: (la, lo) => lo < -25 && lo > -170 && la > -60 };
    default: // planeta, luna, todo
      return { nombre: "el planeta Tierra", lat: -34.6, lon: -58.4, expansion: 4.5,
               dentro: i => tipo[i] !== 0 || rnd2[i] < { planeta: 0.75, luna: 0.97, todo: 1 }[nivel.id],
               dentroAnimal: () => true };
  }
}

function prepararDestruccion(texto) {
  const palabras = contarPalabras(texto);
  const nivel = nivelDe(palabras);
  const obj = definirObjetivo(nivel);
  const comienzo = reloj + INICIO;

  // 1) qué puntos nuevos entran y cuál es el más lejano (para repartir la expansión)
  const elegidos = [];
  let maxDist = 0.01;
  for (let i = 0; i < N; i++) {
    if (golpe[i] !== Infinity || !obj.dentro(i)) continue;   // ya destruido o fuera del objetivo
    const d = distancia(i, obj.lat, obj.lon);
    elegidos.push(i, d);
    if (d > maxDist) maxDist = d;
  }
  // 2) cuándo le llega el fuego a cada punto
  let nuevosTierra = 0, nuevosOceano = 0;
  for (let j = 0; j < elegidos.length; j += 2) {
    const i = elegidos[j];
    golpe[i] = comienzo + (elegidos[j + 1] / maxDist) * obj.expansion + rnd[i] * 0.4 + (tipo[i] === 0 ? 0.6 : 0);
    tipo[i] === 0 ? nuevosOceano++ : nuevosTierra++;
  }
  // 3) animales
  ANIMALES.forEach(([, la, lo], a) => {
    if (golpeAnimal[a] === Infinity && obj.dentroAnimal(la, lo)) {
      golpeAnimal[a] = comienzo + (Math.acos(lim(Math.sin(la * RAD) * Math.sin(obj.lat * RAD) + Math.cos(la * RAD) * Math.cos(obj.lat * RAD) * Math.cos((lo - obj.lon) * RAD), -1, 1)) / maxDist) * obj.expansion;
    }
  });
  // 4) extras de los niveles más altos
  if (nivel.id === "luna" || nivel.id === "todo") {
    lavaFrac = Math.max(lavaFrac, nivel.id === "todo" ? 0.35 : 0.15);
    if (lunaExplota === Infinity) lunaExplota = comienzo + obj.expansion * 0.8;
  }

  // en los niveles planetarios el informe cuenta todo lo destruido, no solo lo nuevo
  if (["planeta", "luna", "todo"].includes(nivel.id)) {
    nuevosTierra = 0; nuevosOceano = 0;
    for (let i = 0; i < N; i++) if (golpe[i] !== Infinity) tipo[i] === 0 ? nuevosOceano++ : nuevosTierra++;
  }

  return {
    t0: reloj, palabras, nivel, objetivo: obj, texto,
    nuevosTierra, nuevosOceano,
    fin: INICIO + obj.expansion + 4,
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
    if (rnd2[i] < lavaFrac) return ((rnd[i] * 7 + t * 3) | 0) % 2 ? IDX.lava1 : IDX.lava2;
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
