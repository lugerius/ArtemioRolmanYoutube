# ArtemioRolmanYoutube

https://artemiorolman.us.to

Buscador de preguntas de los programas de "Platicando con Artemio y Rolman"
https://www.youtube.com/c/ArtemioUrbina/

Se integró además la búsqueda de música de los programas NoContextSynth

Permite creación de playlist.

Se pueden mandar búsquedas por URI directamente con el formato siguiente

https://artemiorolman.us.to/?q=patron1

o por múltiples patrones separados por %2B equivalente al símbolo de + (suma los resultados donde aparezcan los patrones) o por %20 equivalente a espacio " " (muestra los resultados solo donde todos los patrones se cumplan en una sola pregunta). 

https://artemiorolman.us.to/?q=patron1%2Bpatron2

La búsqueda múltiple también se puede hacer desde el input de búsqueda separando las palabras con un signo de +

El usar "q" en URI hace las búsquedas en los programas de Preguntas de Artemio y Rolman, mientras que al usar "m" realiza la busqueda en los episodios de NoContextSynth 

Está basado en el buscador de ScoreVG https://github.com/lugerius/ScoreVGSearch y adaptado para la API de Youtube.

La lista de preguntas se obtiene directamente del indexado de las mismas en los episodios de Youtube y se meten a un archivo JSON (js/artrol.json) con el episodio, los timecodes y la duración de cada una.

Hay un archivo en Google drive que tiene la lista completa de las preguntas indexadas
https://docs.google.com/spreadsheets/d/1sC5BDaQklPzsLZiDoz-mum9w14a-7Z-dOeE3G1IfpXA/edit?usp=sharing

Livechat captura las preguntas del chat del stream en vivo, tanto de Youtube como del espejo en Twitch


# Para usarlo como aplicación en dispositivos móviles.

Abrir la página en el navegador. En opciones click en añadir a pantalla de inicio.

# Notas

Se puede modificar la forma de obtener los datos mediante la generación de un JSON dinámico a partir de una base de datos (SQL). Este cambio requeriría cambiar un poco el js/engine.js y de un nuevo archivo (php, python, etc) que haga la conexión con la base de datos.





