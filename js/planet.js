// =====================================================================
// 3. CONSTRUCCIÓN DEL PLANETA: una grilla de puntos cada 2 grados
// =====================================================================
const PASO = 2;
const N = (180 / PASO) * (360 / PASO);
const sinLat = new Float32Array(N), cosLat = new Float32Array(N), sinLon = new Float32Array(N), cosLon = new Float32Array(N);
const tipo = new Uint8Array(N);        // 0 océano, 1 tierra, 2 hielo
const rnd = new Float32Array(N), rnd2 = new Float32Array(N), golpe = new Float32Array(N);
const pantX = new Float32Array(N), pantY = new Float32Array(N), pantZ = new Float32Array(N);

let k = 0;
for (let lat = -89; lat <= 89; lat += PASO) {
  for (let lon = -179; lon <= 179; lon += PASO) {
    sinLat[k] = Math.sin(lat * RAD); cosLat[k] = Math.cos(lat * RAD);
    sinLon[k] = Math.sin(lon * RAD); cosLon[k] = Math.cos(lon * RAD);
    let t = 0;
    if (lat < -66 + 2 * Math.sin(lon * RAD * 4)) t = 2;
    else if (CONTINENTES.some(p => enPoligono(lon, lat, p))) t = (lat > 72 || enPoligono(lon, lat, GROENLANDIA)) ? 2 : 1;
    tipo[k] = t; rnd[k] = Math.random(); rnd2[k] = Math.random(); golpe[k] = Infinity;
    k++;
  }
}
const ARBOLES = [];
for (let i = 0; i < N; i++) if (tipo[i] === 1 && rnd[i] < 0.09) ARBOLES.push(i);

// =====================================================================
// 4. PALETA (cada color en 8 niveles de luz para dar volumen 3D)
// =====================================================================
const COLORES = {
  verde1: [46, 139, 58], verde2: [70, 166, 72], hielo: [236, 246, 252], fuego1: [255, 92, 28], fuego2: [255, 176, 40],
  fuego3: [214, 38, 18], carbon: [44, 37, 33], arena1: [222, 190, 125], arena2: [200, 164, 98], barro: [118, 104, 78],
  lecho: [190, 158, 102], derretido: [110, 160, 200], lava1: [255, 70, 20], lava2: [170, 28, 8],
};
const NOMBRES = Object.keys(COLORES);
const IDX = {}; NOMBRES.forEach((n, i) => IDX[n] = i);
const ESTILOS = [];
NOMBRES.forEach(n => {
  for (let l = 0; l < 8; l++) {
    const f = 0.42 + 0.58 * l / 7, c = COLORES[n];
    ESTILOS.push(`rgb(${c[0] * f | 0},${c[1] * f | 0},${c[2] * f | 0})`);
  }
});
const BALDES = ESTILOS.map(() => []);
const EMISIVOS = new Set([IDX.fuego1, IDX.fuego2, IDX.fuego3, IDX.lava1, IDX.lava2]);
