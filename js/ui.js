// =====================================================================
// 7. PANEL DE DATOS
// =====================================================================
const ETAPAS = [
  [0, "Detectando tu ubicación…"],
  [0.8, "Origen detectado: {pais}. Empezamos por ahí."],
  [INICIO, "Enviando tu consulta al data center…"],
  [INICIO + 0.9, "Refrigerando servidores con bosque nativo…"],
  [INICIO + 2.0, "Evaporando océanos para enfriar las GPUs…"],
  [INICIO + 3.0, "Reubicando especies (sin éxito)…"],
  [INICIO + 4.2, "Generando respuesta…"],
];

function actualizarPanel(t, prog, focos, extintos, totalAnimales) {
  let msg = ETAPAS[0][1];
  for (const [desde, m] of ETAPAS) if (t >= desde) msg = m;
  if (sim.lunaExplota < Infinity && t >= sim.lunaExplota && t < sim.lunaExplota + 2) msg = "Daño colateral: la Luna.";
  document.getElementById("estadoTexto").textContent = msg.replace("{pais}", sim.pais.nombre);
  document.getElementById("estadoPct").textContent = Math.round(lim(t / sim.fin, 0, 1) * 100) + " %";
  document.getElementById("barraRelleno").style.width = lim(t / sim.fin, 0, 1) * 100 + "%";

  const r = sim.resultado;
  const salud = 100 - (100 - r.salud) * prog;
  document.getElementById("saludTexto").textContent = fmt(salud, 4) + " %";
  const barra = document.getElementById("saludBarra");
  barra.style.width = salud + "%";
  barra.style.background = `rgb(${mezcla([46, 158, 79], [200, 40, 30], 1 - salud / 100)})`;
  document.getElementById("vArboles").textContent = fmt(r.arboles * prog, 0);
  document.getElementById("vOceano").textContent = fmt(r.oceanoPct * prog, 4) + " %";
  document.getElementById("vEspecies").textContent = fmt(r.especies * prog, 0);
  document.getElementById("vIncendios").textContent = fmt(focos * 1373, 0);

  if (t >= sim.fin && !sim.terminado) {
    sim.terminado = true;
    document.getElementById("estadoTexto").textContent = "Respuesta lista. El planeta, no tanto.";
    const boton = document.getElementById("boton");
    boton.disabled = false; boton.textContent = "Restaurar el planeta y consultar de nuevo";
    mostrarResultado();
  }
}

function calcularResultado(texto) {
  const azar = crearAzar(hashTexto(texto));
  const L = texto.length, nivel = lim(L / 300, 0, 1);
  const tokens = Math.ceil(L / 4) + 350 + L * 9;
  const fracTierra = 0.84 + 0.16 * nivel;
  return {
    L, tokens,
    arboles: 3.04e12 * fracTierra * (0.97 + 0.03 * azar()),
    hectareas: 4.06e9 * fracTierra * (0.95 + 0.05 * azar()),
    oceanoPct: (30 + 70 * nivel) * (0.97 + 0.03 * azar()),
    litros: 1.335e9 * (0.3 + 0.7 * nivel) * (0.97 + 0.03 * azar()), // en billones de litros
    especies: 8.7e6 * (0.65 + 0.35 * nivel) * (0.96 + 0.04 * azar()),
    pinguinos: 2.1e7 * (0.65 + 0.35 * nivel) + azar() * 1000,
    arena: 9.81e11 * fracTierra * (0.9 + 0.1 * azar()),
    salud: 4.2 * Math.pow(1 - nivel, 2) + 0.0003 + azar() * 0.0001,
  };
}
