# ArtemioRolmanYoutube
https://artemiorolman.us.to

Buscador de preguntas de los programas de "Platicando con Artemio y Rolman"
https://www.youtube.com/c/ArtemioUrbina/

Se integró además la búsqueda de música de los programas NoContextSynth

Permite creación de playlist de preguntas

Está basado en el buscador de ScoreVG https://github.com/lugerius/ScoreVGSearch y adaptado para la API de Youtube.
Al igual que el buscador de ScoreVG, requiere de jquery y jquerymobile.

La lista de preguntas se obtiene directamente del indexado de las mismas en los episodios de Youtube y se meten a un archivo JSON (js/artrol.json) con el episodio, los timecodes y la duración de cada una.

Hay un archivo en Google drive que tiene la lista completa de las preguntas indexadas
https://docs.google.com/spreadsheets/d/1sC5BDaQklPzsLZiDoz-mum9w14a-7Z-dOeE3G1IfpXA/edit?usp=sharing

Livechat captura las preguntas del chat del stream en vivo, tanto de Youtube como del espejo en Twitch


# Para usarlo como aplicación en dispositivos móviles.

Abrir la página en el navegador. En opciones click en añadir a pantalla de inicio.

# Notas

Se puede modificar la forma de obtener los datos mediante la generación de un JSON dinámico a partir de una base de datos (SQL). Este cambio requeriría cambiar un poco el js/engine.js y de un nuevo archivo (php, python, etc) que haga la conexión con la base de datos.





