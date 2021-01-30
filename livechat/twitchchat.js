/*
# 	YoutubeSearch "Platicando con Artemio y Rolman"
#	https://www.youtube.com/c/ArtemioUrbina/
#
#     Copyright (C) 2020-2021  Luis G. Mendoza @lugerius
#
#     This file is part of the YoutubeSearch "Platicando con Artemio y Rolman"
#
#     This program is free software: you can redistribute it and/or modify
#     it under the terms of the GNU General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     This program is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU General Public License for more details.
#
#     You should have received a copy of the GNU General Public License
#     along with this program.  If not, see <https://www.gnu.org/licenses/>.
#	
#
#	livechat/twitchchat.js: Obtiene las preguntas de un chat en vivo de una transmisión de Twitch
#							Se ejecuta del lado del servidor y solamente genera un archivo CSV que después es leído
# 							por livechat/index.html. En el servidor cambiar los permisos de este archivo a 0700
#	
#	REQUISITOS:
#
#	
#	Requiere de la librería https://tmijs.com
# 	Requiere que se tenga ejecutando nodejs en el servidor.
#
#   USO: 
#
#	node twitchchat.js [TWITCHCHANNEL] [CAPTURESRTING]
*/


args = process.argv.slice(2);
if (!args[0]) {
    console.log("Usar: node twitchchat.js [TWITCHCHANNEL] [\"CAPTURESTRING\"]");
    process.exit();
}
const tmi = require('tmi.js');
const fs = require('fs');
const { exit } = require('process');

const client = new tmi.Client({
	connection: {
		secure: true,
		reconnect: true
	},
	channels: [ args[0] ]
});

client.connect();
setInterval(function(){client.disconnect(); process.exit()}, 18000000);
client.on('message', (channel, tags, message, self) => {
    var textMessage = message.toLowerCase();
    if (textMessage.includes(args[1])) {
        //const regex =  new RegExp(args[1],'gi');
        textMessage = message.replace(args[1], ""); 
        textMessage = textMessage.replace(/[`~$%^'<>\{\}\[\]\\\/]/gi, "");
        textMessage = textMessage.replace(/"/gi, "-");
        var hourPost = new Date().toISOString();
        var hashTag = fs.createWriteStream("listapreguntas.csv", {flags:'a'});
        hashTag.write(`"TW-${tags['display-name']}","${textMessage}","${hourPost}"\n`);
        hashTag.end();
        //console.log(`"${tags['display-name']}","${textMessage}","${hourPost}"`);
    }
});

	