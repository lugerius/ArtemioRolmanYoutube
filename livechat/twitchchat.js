/* 
#
#	Obtiene las preguntas de un chat en vivo de una transmisión de Twitch
#	
#	REQUISITOS:
#
#	
#	Requiere de la librería https://tmijs.com
# 	Requiere que se tenga ejecutando node en el servidor.
#
# USO: 
#	node twitchchat.js [TWITCHCHANNEL] [CAPTURESRTING]
*/
args = process.argv.slice(2);
if (!args[0]) {
    console.log("Usar: node twitchchat.js [TWITCHCHANNEL] [CAPTURESTRING]");
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
setInterval(function(){client.disconnect(); exit()}, 18000000);
client.on('message', (channel, tags, message, self) => {
    var textMessage = message.toLowerCase();
    if (textMessage.includes(args[1])) {
        const regex =  new RegExp(args[1],'gi');
        textMessage = message.replace(regex, ""); 
        textMessage = textMessage.replace(/[`~$%^'<>\{\}\[\]\\\/]/gi, "");
        textMessage = textMessage.replace(/"/gi, "-");
        var hourPost = new Date().toISOString();
        var hashTag = fs.createWriteStream("listapreguntas.csv", {flags:'a'});
        hashTag.write(`"${tags['display-name']}","${textMessage}","${hourPost}"\n`);
        hashTag.end();
        console.log(`"${tags['display-name']}","${textMessage}","${hourPost}"`);
    }
});

	