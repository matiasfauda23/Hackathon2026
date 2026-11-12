# 🌍 HuellaIA

**Pabellón:** 4. Decisiones Exageradas
**Ingrediente improbable:** Número absurdamente preciso

## El problema
Cada vez que le hacemos una consulta a una IA se consumen recursos (energía, agua para enfriar servidores...), pero nadie sabe cuánto. Programadores y estudiantes hacemos decenas de consultas por día sin tener idea de lo que "cuestan" al planeta.

## La solución
HuellaIA calcula, con una precisión absurda, cuántos recursos del planeta consume tu consulta: árboles talados, hectáreas incendiadas, agua evaporada, especies extintas, pingüinos desalojados y arena generada.

Mientras calcula, un planeta 3D muestra la destrucción en vivo: se incendian los bosques, se secan los océanos, desaparecen los animales y la página pasa de verde y natural a desierto. **Cada consulta destruye algo más**, y después aparece un mensaje irónico felicitándote por lo que eliminaste:

| Consulta | Se destruye |
|---|---|
| 1.ª | Tucumán, junto con la casa de Santiago y la de Gabi de IntegrarTEC |
| 2.ª | Francia (total, salió segunda) |
| 3.ª | India |
| 4.ª | Argentina |
| 5.ª | América |
| 6.ª | El planeta Tierra |
| 7.ª | El planeta y la Luna, con pantalla de "¡Felicitaciones!" |

## Cómo probarlo
1. Descargá el repositorio y abrí `index.html` en un navegador (Chrome, Firefox o Edge). No hace falta instalar nada.
2. Escribí cualquier consulta y tocá "Calcular impacto de mi consulta": se destruye Tucumán.
3. Después de cada destrucción aparece un informe oficial con las cifras y la pregunta "¿Desea continuar destruyendo el planeta?". Con "Sí" seguís consultando y con "No" se restaura el planeta.
4. El botón "Restaurar el planeta" lo deja como nuevo y reinicia la secuencia.

## Cómo funciona
- **Planeta:** los continentes son polígonos simplificados (longitud y latitud). Se arma una grilla de puntos cada 2 grados, se marca cuáles son tierra, océano o hielo, y se dibujan en un `<canvas>` con proyección ortográfica para que parezca una esfera 3D que gira.
- **Secuencia:** `SECUENCIA` (en `data.js`) define qué se destruye en cada consulta. `definirObjetivo()` decide qué puntos entran (un círculo alrededor de Tucumán, Francia o India, el contorno de Argentina, la longitud de América o todo el planeta).
- **Informe:** `mostrarResultado()` abre un pop-up con formato de documento oficial, y `mensajeIronico()` arma un mensaje distinto para cada consulta, con las cifras de lo destruido.
- **Destrucción:** `prepararDestruccion()` calcula cuándo le llega el fuego a cada punto según su distancia al objetivo. `colorDe()` decide su color según el tiempo que pasó: verde → fuego → carbón → arena. Lo destruido queda destruido hasta restaurar.
- **Cifras:** `calcularResultado()` genera los números a partir del texto, así que la misma consulta da siempre el mismo resultado. Todas las cifras son inventadas.

## Herramientas de IA utilizadas
- Claude: para pensar y ajustar la idea, generar el código y el README.
