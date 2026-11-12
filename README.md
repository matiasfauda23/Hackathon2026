# 🌍 HuellaIA

**Pabellón:** 4. Decisiones Exageradas
**Ingrediente improbable:** Número absurdamente preciso

## El problema
Cada vez que le hacemos una consulta a una IA se consumen recursos (energía, agua para enfriar servidores...), pero nadie sabe cuánto. Programadores y estudiantes hacemos decenas de consultas por día sin tener idea de lo que "cuestan" al planeta.

## La solución
HuellaIA calcula, con una precisión absurda, cuántos recursos del planeta consume tu consulta: árboles talados, hectáreas incendiadas, litros de océano evaporados, especies extintas, pingüinos desalojados y arena generada.

Mientras calcula, un planeta 3D muestra la destrucción en vivo: arranca en tu país (se detecta por la zona horaria), se incendian los bosques, se secan los océanos, desaparecen los animales y la página pasa de verde y natural a desierto. Lo gracioso es que, por más corta que sea la consulta, se destruye casi todo. Y cuanto más larga es, peor: aparece lava y, con consultas muy largas, explota la Luna.

## Cómo probarlo
1. Descargá el repositorio y abrí `index.html` en un navegador (Chrome, Firefox o Edge). No hace falta instalar nada.
2. Escribí una consulta (probá primero con "hola" y después con un texto largo) y tocá "Calcular impacto de mi consulta".
3. Vas a ver la animación del planeta destruyéndose y, al final, el informe de impacto con las cifras. El botón "Restaurar el planeta" lo deja como nuevo.

## Cómo funciona
- **Planeta:** los continentes son polígonos simplificados (longitud y latitud). Se arma una grilla de puntos cada 2 grados, se marca cuáles son tierra, océano o hielo, y se dibujan en un `<canvas>` con proyección ortográfica para que parezca una esfera 3D que gira.
- **Destrucción:** `prepararDestruccion()` calcula, para cada punto, cuándo lo alcanza la destrucción según su distancia a tu país. `colorDe()` decide su color según el tiempo que pasó: verde → fuego → carbón → arena.
- **Nivel de daño:** depende del largo de la consulta (0 a 300 caracteres). Define qué porcentaje de tierra, océano y animales se destruye, si aparece lava y si explota la Luna.
- **Cifras:** `calcularResultado()` genera los números a partir del texto, así que la misma consulta da siempre el mismo resultado. Todas las cifras son inventadas.

## Herramientas de IA utilizadas
- Claude: para pensar y ajustar la idea, generar el código y el README.
