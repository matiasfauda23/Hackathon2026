# 🌍 HuellaIA

**Pabellón:** 4. Decisiones Exageradas
**Ingrediente improbable:** Número absurdamente preciso

## El problema
Cada vez que le hacemos una consulta a una IA se consumen recursos (energía, agua para enfriar servidores...), pero nadie sabe cuánto. Programadores y estudiantes hacemos decenas de consultas por día sin tener idea de lo que "cuestan" al planeta.

## La solución
HuellaIA calcula, con una precisión absurda, cuántos recursos del planeta consume tu consulta: árboles talados, hectáreas incendiadas, agua evaporada, especies extintas, pingüinos desalojados y arena generada.

Mientras calcula, un planeta 3D muestra la destrucción en vivo: se incendian los bosques, se secan los océanos, desaparecen los animales y la página pasa de verde y natural a desierto. **Cuantas más palabras tiene la consulta, más se destruye**, y el daño se acumula entre consultas:

| Palabras | Se destruye |
|---|---|
| 1 a 5 | Una provincia argentina (la primera es Tucumán; después, una al azar) |
| 6 a 9 | Argentina entera |
| 10 a 12 | El continente americano |
| 13 a 14 | El planeta Tierra |
| 15 a 16 | La Tierra y la Luna |
| 17 o más | Todos los recursos del planeta (con pantalla de "¡Felicitaciones!") |

## Cómo probarlo
1. Descargá el repositorio y abrí `index.html` en un navegador (Chrome, Firefox o Edge). No hace falta instalar nada.
2. Escribí una consulta de 3 palabras (por ejemplo "hola cómo estás") y tocá "Calcular impacto de mi consulta": se destruye Tucumán.
3. Probá consultas cada vez más largas (6, 10, 13, 15 y 17 palabras) para ver cómo escala la destrucción. Debajo del cuadro de texto se ve qué vas a destruir.
4. El botón "Restaurar el planeta" lo deja como nuevo.

## Cómo funciona
- **Planeta:** los continentes son polígonos simplificados (longitud y latitud). Se arma una grilla de puntos cada 2 grados, se marca cuáles son tierra, océano o hielo, y se dibujan en un `<canvas>` con proyección ortográfica para que parezca una esfera 3D que gira.
- **Niveles:** `contarPalabras()` y `nivelDe()` deciden el nivel según la cantidad de palabras. `definirObjetivo()` decide qué zona entra (un círculo alrededor de una provincia, el contorno de Argentina, la longitud de América o todo el planeta).
- **Destrucción:** `prepararDestruccion()` calcula cuándo le llega el fuego a cada punto según su distancia al objetivo. `colorDe()` decide su color según el tiempo que pasó: verde → fuego → carbón → arena. Lo destruido queda destruido hasta restaurar.
- **Cifras:** `calcularResultado()` genera los números a partir del texto, así que la misma consulta da siempre el mismo resultado. Todas las cifras son inventadas.

## Herramientas de IA utilizadas
- Claude: para pensar y ajustar la idea, generar el código y el README.
