// =====================================================================
// 7. PANEL DE DATOS
// =====================================================================
let consumidoTodo = false;         // true cuando se llegó al último nivel
let estabaMuerto = false;

const ETAPAS = [
  [0, "Buscando un objetivo…"],
  [0.8, "Objetivo: {obj}."],
  [INICIO, "Enviando tu consulta al data center…"],
  [INICIO + 0.8, "Refrigerando servidores con los bosques de {obj}…"],
  [INICIO + 2.0, "Evaporando agua para enfriar las GPUs…"],
  [INICIO + 3.2, "Reubicando especies (sin éxito)…"],
  [INICIO + 4.5, "Generando respuesta…"],
];

// Salud del planeta según lo que ya se destruyó (acumulado entre consultas)
function calcularSalud() {
  if (consumidoTodo) return 0;
  let s = 100 * (1 - 0.8 * estad.tierra / TOTAL_TIERRA - 0.2 * estad.oceano / TOTAL_OCEANO);
  if (reloj >= lunaExplota) s *= 0.004;
  return lim(s, 0, 100);
}

function actualizarPanel(tSim) {
  const salud = calcularSalud();
  const tierraF = estad.tierra / TOTAL_TIERRA;
  document.getElementById("saludTexto").textContent = fmt(salud, 4) + " %";
  const barra = document.getElementById("saludBarra");
  barra.style.width = salud + "%";
  barra.style.background = `rgb(${mezcla([46, 158, 79], [200, 40, 30], 1 - salud / 100)})`;
  document.getElementById("vArboles").textContent = fmt(3.04e12 * tierraF, 0);
  document.getElementById("vOceano").textContent = fmt(100 * estad.oceano / TOTAL_OCEANO, 4) + " %";
  document.getElementById("vEspecies").textContent = fmt(8.7e6 * (0.7 * tierraF + 0.3 * estad.animales / ANIMALES.length), 0);
  document.getElementById("vIncendios").textContent = fmt(estad.focos * 1373, 0);

  // la página se va secando a medida que baja la salud
  const dano = 1 - salud / 100;
  document.getElementById("fondoMuerto").style.opacity = dano;
  document.querySelector(".cielo.muerto").style.opacity = dano;
  const muerto = salud < 50;
  if (muerto !== estabaMuerto) {
    estabaMuerto = muerto;
    document.body.classList.toggle("muerto", muerto);
    document.querySelectorAll(".hoja").forEach(h => h.textContent = muerto ? "🍂" : h.dataset.original);
  }

  if (!sim || sim.terminado) return;
  let msg = ETAPAS[0][1];
  for (const [desde, m] of ETAPAS) if (tSim >= desde) msg = m;
  if (lunaExplota < Infinity && reloj >= lunaExplota && reloj < lunaExplota + 2) msg = "Daño colateral: la Luna.";
  document.getElementById("estadoTexto").textContent = msg.replace("{obj}", sim.objetivo.nombre);
  const p = lim(tSim / sim.fin, 0, 1);
  document.getElementById("estadoPct").textContent = Math.round(p * 100) + " %";
  document.getElementById("barraRelleno").style.width = p * 100 + "%";

  if (tSim >= sim.fin) {
    sim.terminado = true;
    document.getElementById("estadoTexto").textContent = "Respuesta lista. " + (sim.objetivo.nombre === "el planeta Tierra" ? "El planeta, no tanto." : sim.objetivo.nombre + ", no tanto.");
    const boton = document.getElementById("boton");
    boton.disabled = false; boton.textContent = "Calcular impacto de otra consulta";
    if (sim.nivel.id === "todo") { consumidoTodo = true; document.getElementById("final").classList.add("visible"); }
    mostrarResultado();
  }
}

function calcularResultado(texto, s) {
  const azar = crearAzar(hashTexto(texto));
  const dT = s.nuevosTierra / TOTAL_TIERRA, dO = s.nuevosOceano / TOTAL_OCEANO;
  const tokens = Math.ceil(texto.length / 4) + 350 + texto.length * 9;
  return {
    tokens,
    agua: tokens * 0.519 * (0.95 + 0.1 * azar()),
    arboles: 3.04e12 * dT * (0.97 + 0.03 * azar()),
    hectareas: 4.06e9 * dT * (0.95 + 0.05 * azar()),
    litros: 1.335e9 * dO * (0.97 + 0.03 * azar()),
    especies: 8.7e6 * dT * (0.96 + 0.04 * azar()),
    pinguinos: 2.1e7 * dT + azar() * 3,
    arena: 9.81e11 * dT * (0.9 + 0.1 * azar()),
  };
}

// Un mensaje irónico distinto para cada consulta
function mensajeIronico(n, r) {
  const M = [
    `Perfecto, esperamos que estés conforme con tu respuesta. Tu consulta tan solo eliminó <b>Tucumán</b>, junto con
     <b>la casa de Santiago</b> y <b>la casa de Gabi</b> de IntegrarTEC. Son ${fmt(r.arboles, 2)} árboles y dos profes menos. ¡Seguí así!`,
    `¡Excelente pregunta! Para responderla tuvimos que borrar <b>Francia</b> del mapa. Total, ya había salido segunda.
     Se perdieron ${fmt(r.especies, 1)} especies y ni un croissant quedó en pie. ¡Muy bien!`,
    `Qué buena consulta. Le costó <b>India</b> entera: ${fmt(r.hectareas, 3)} hectáreas incendiadas y 1.400 millones de personas sin wifi.
     Pero vos tenés tu respuesta, que es lo importante. ¡Prioridades!`,
    `Listo: tu consulta destruyó <b>Argentina</b>. Tranqui, el país ya estaba acostumbrado a las crisis.
     ${fmt(r.arboles, 2)} árboles menos y el asado del domingo, suspendido. ¡Felicitaciones!`,
    `Ahora no queda <b>América</b>, de Alaska a Ushuaia: ${fmt(r.especies, 1)} especies extintas.
     Eso sí, la respuesta salió muy bien redactada. ¡Valió la pena!`,
    `Impecable. Para contestarte se evaporó el ${fmt(r.oceanoPct, 4)} % de los océanos y no queda ni un bosque en <b>el planeta</b>.
     Por suerte la IA te respondió con muchísima amabilidad. ¡Seguí consultando!`,
    `Lo lograste: no queda <b>planeta</b> ni <b>Luna</b>. Tu respuesta está lista, pero ya no hay electricidad para leerla.`,
  ];
  return M[Math.min(n, M.length) - 1];
}

function mostrarResultado() {
  const r = sim.resultado;
  r.oceanoPct = 100 * estad.oceano / TOTAL_OCEANO;
  const siguiente = consultas < SECUENCIA.length ? SECUENCIA[consultas] : null;
  const div = document.getElementById("resultado");
  div.innerHTML = `
    <h2>Informe de impacto</h2>
    <table>
      <tr><td>Consulta número</td><td>${sim.numero}</td></tr>
      <tr><td>Zona destruida</td><td>${sim.objetivo.nombre}</td></tr>
      <tr><td>Tokens consumidos (consulta + respuesta)</td><td>${fmt(r.tokens, 0)}</td></tr>
      <tr><td>Agua usada para enfriar servidores</td><td>${fmt(r.agua, 3)} L</td></tr>
      <tr><td>Árboles talados</td><td>${fmt(r.arboles, 2)}</td></tr>
      <tr><td>Hectáreas incendiadas</td><td>${fmt(r.hectareas, 3)}</td></tr>
      <tr><td>Agua de océano evaporada</td><td>${fmt(r.litros, 4)} billones de L</td></tr>
      <tr><td>Especies extintas</td><td>${fmt(r.especies, 1)}</td></tr>
      <tr><td>Pingüinos desalojados</td><td>${fmt(r.pinguinos, 2)}</td></tr>
      <tr><td>Arena generada</td><td>${fmt(r.arena, 1)} t</td></tr>
    </table>
    <div class="conclusion">${mensajeIronico(sim.numero, r)}
      <br><small>Salud del planeta: <b>${fmt(calcularSalud(), 4)} %</b>.
      ${siguiente ? `Próxima consulta: ${siguiente.nombre}.` : "No queda nada más para destruir."}</small></div>
    <p class="nota">Cifras 100 % inventadas, calculadas con máxima seriedad. Ningún pingüino fue dañado en la realización de este cálculo.</p>`;
  div.style.display = "block";
}

// =====================================================================
// 8. INTERACCIÓN
// =====================================================================
const textarea = document.getElementById("pregunta");
function actualizarIndicador() {
  document.getElementById("nivelTexto").innerHTML = consultas < SECUENCIA.length
    ? `Próxima consulta destruye: <b>${siguienteObjetivo().nombre}</b>`
    : "<b>Ya no queda nada para destruir.</b>";
  document.getElementById("nivelChars").textContent = `Consultas hechas: ${consultas}`;
}
actualizarIndicador();

function consultar() {
  if (sim && !sim.terminado) return;
  const aviso = document.getElementById("nivelTexto");
  if (consumidoTodo) { aviso.innerHTML = "<b>Ya no queda planeta. Restauralo para seguir consultando.</b>"; return; }
  const texto = textarea.value.trim();
  if (!texto) { aviso.innerHTML = "<b>Hasta una consulta vacía contamina. Escribí algo.</b>"; return; }
  sim = prepararDestruccion(texto);
  sim.resultado = calcularResultado(texto, sim);
  actualizarIndicador();
  const boton = document.getElementById("boton");
  boton.disabled = true; boton.textContent = "Consultando… (el planeta lo está pagando)";
  document.getElementById("resultado").style.display = "none";
}

function restaurar() {
  sim = null; particulas = []; fragmentosLuna = null;
  golpe.fill(Infinity); golpeAnimal.fill(Infinity);
  lavaFrac = 0; lunaExplota = Infinity; consultas = 0; consumidoTodo = false;
  actualizarIndicador();
  document.getElementById("final").classList.remove("visible");
  document.getElementById("resultado").style.display = "none";
  document.getElementById("estadoTexto").textContent = "Planeta restaurado. Disfrutalo mientras dure.";
  document.getElementById("estadoPct").textContent = "";
  document.getElementById("barraRelleno").style.width = "0";
  const boton = document.getElementById("boton");
  boton.disabled = false; boton.textContent = "Calcular impacto de mi consulta";
}

// Hojas decorativas
const hojas = document.getElementById("hojas");
for (let i = 0; i < 14; i++) {
  const h = document.createElement("span");
  h.className = "hoja";
  h.dataset.original = h.textContent = ["🍃", "🌿", "🌱", "🍀"][i % 4];
  h.style.left = Math.random() * 100 + "vw";
  h.style.animationDuration = 9 + Math.random() * 10 + "s";
  h.style.animationDelay = -Math.random() * 15 + "s";
  hojas.appendChild(h);
}
