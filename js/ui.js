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

function mostrarResultado() {
  const r = sim.resultado;
  const div = document.getElementById("resultado");
  div.innerHTML = `
    <h2>Informe de impacto</h2>
    <table>
      <tr><td>Largo de la consulta</td><td>${r.L} caracteres</td></tr>
      <tr><td>Tokens consumidos (consulta + respuesta)</td><td>${fmt(r.tokens, 0)}</td></tr>
      <tr><td>Árboles talados</td><td>${fmt(r.arboles, 2)}</td></tr>
      <tr><td>Hectáreas incendiadas</td><td>${fmt(r.hectareas, 3)}</td></tr>
      <tr><td>Agua de océano evaporada</td><td>${fmt(r.litros, 4)} billones de L</td></tr>
      <tr><td>Especies extintas</td><td>${fmt(r.especies, 1)}</td></tr>
      <tr><td>Pingüinos desalojados</td><td>${fmt(r.pinguinos, 2)}</td></tr>
      <tr><td>Arena generada</td><td>${fmt(r.arena, 1)} t</td></tr>
      <tr><td>Origen del desastre</td><td>${sim.pais.nombre}</td></tr>
      <tr><td>Daño colateral</td><td>${sim.lunaExplota < Infinity ? "La Luna" : "Ninguno (por ahora)"}</td></tr>
    </table>
    <div class="conclusion">Tu consulta de <b>${r.L} caracteres</b> dejó al planeta con un <b>${fmt(r.salud, 4)} %</b> de salud.
      ${r.L < 40 ? "Y eso que era cortita." : "Si hubieras sido más breve, quedaban un par de árboles."}
      ${sim.lunaExplota < Infinity ? "Por suerte no le dijiste «gracias»: también se iba Marte." : "Si además le hubieras dicho «gracias», también se iba la Luna."}</div>
    <p class="nota">Cifras 100 % inventadas, calculadas con máxima seriedad. Ningún pingüino fue dañado en la realización de este cálculo.</p>`;
  div.style.display = "block";
}

// =====================================================================
// 8. INTERACCIÓN
// =====================================================================
const textarea = document.getElementById("pregunta");
textarea.addEventListener("input", () => {
  const L = textarea.value.trim().length, nivel = lim(L / 300, 0, 1);
  const nombres = [[0.15, "Catastrófico"], [0.4, "Apocalíptico"], [0.7, "Extinción masiva"], [0.9, "Colapso planetario (con lava)"], [1.01, "Fin del sistema solar (incluye la Luna)"]];
  const n = nombres.find(([max]) => nivel < max)[1];
  document.getElementById("nivelTexto").innerHTML = L ? `Daño previsto: <b>${n}</b>` : "Escribí algo… si te animás.";
  document.getElementById("nivelChars").textContent = `${L} caracteres`;
});

function consultar() {
  const boton = document.getElementById("boton");
  if (sim && sim.terminado) { restaurar(); return; }
  const texto = textarea.value.trim();
  if (!texto) { document.getElementById("nivelTexto").innerHTML = "<b>Hasta una consulta vacía contamina. Escribí algo.</b>"; return; }
  sim = prepararDestruccion(texto, detectarPais());
  sim.resultado = calcularResultado(texto);
  boton.disabled = true; boton.textContent = "Consultando… (el planeta lo está pagando)";
  document.getElementById("resultado").style.display = "none";
  setTimeout(() => document.body.classList.add("muerto"), INICIO * 1000);
  document.querySelectorAll(".hoja").forEach(h => h.textContent = "🍂");
}

function restaurar() {
  sim = null; particulas = [];
  golpe.fill(Infinity);
  document.body.classList.remove("muerto");
  document.querySelectorAll(".hoja").forEach(h => h.textContent = h.dataset.original);
  document.getElementById("resultado").style.display = "none";
  document.getElementById("estadoTexto").textContent = "Planeta restaurado. Disfrutalo mientras dure.";
  document.getElementById("estadoPct").textContent = "";
  document.getElementById("barraRelleno").style.width = "0";
  document.getElementById("saludTexto").textContent = "100,0000 %";
  const barra = document.getElementById("saludBarra");
  barra.style.width = "100%"; barra.style.background = "#2e9e4f";
  ["vArboles", "vEspecies", "vIncendios"].forEach(id => document.getElementById(id).textContent = "0");
  document.getElementById("vOceano").textContent = "0,0000 %";
  document.getElementById("boton").textContent = "Calcular impacto de mi consulta";
}
