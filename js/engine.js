/* YoutubeSearch "Platicando con Artemio y Rolman"
https://www.youtube.com/c/ArtemioUrbina/

    Copyright (C) 2020-2021  Luis G. Mendoza @lugerius

    This file is part of the YoutubeSearch "Platicando con Artemio y Rolman"

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

    
js/engine.js Contiene el motor de busqueda y las funciones necesarias para generar playlist
Documentación de api de youtube https://developers.google.com/youtube/iframe_api_reference */


var params = new URLSearchParams(document.location.search.substring(1));
var startP = 100; // inicializo los estados del reproductor de youtube
if (params.get("m") != null) {
	var qmusic = $('<div>').text(params.get("m")).html();
} 
if (params.get("q") != null) {	
	var pattern = $('<div>').text(params.get("q")).html();
}

$(function() {
	flushPlaylist();
	$("#suggest").focus(function(){
		$("#suggest").val("");
		jsonresult = "";
		$("#autocomplete").fadeOut(200);
	});
	$("#playerContainer").mouseenter(function(){
		$("#autocomplete").fadeOut(200);
	});
	$("#playerContainer").on("tap",function(){
		$("#autocomplete").fadeOut(200);
	});

	// Defino donde buscar (Preguntas o noContext)
	var tipocue = "artrol";
	$("input[type=radio][name=tipocue]").change(function() {
		if (this.value == "artrol") {
			$("#suggest").attr('placeholder', 'Buscar tema o episodio (ep#)');
			tipocue = "artrol";
		}else if (this.value == "noctx") {
			$("#suggest").attr('placeholder', 'Buscar juego o synth');
			tipocue = "noctx";
		}
	});
		
	$("#autocomplete").on("filterablebeforefilter", function ( e, data ) {
		var ul = $( this );
		var dbase = 'js/'+tipocue+'.json?nocache=' + (new Date()).getDay(); // obtiene el archivo json cada día
		var episodestr = ['ep','episodio','ep-','episodio-'];	// Para búsqueda por episodio
		var html = "";
		var results = 0; // contador de resultados
		var allresults = [];
		ul.html( "" );
		var multi = $("#suggest").val().split("+"); // busqueda multiple separada por signo +
		if ( multi[0] && multi[0].length > 2 ) {	// Busco si hay un elemento de busqueda y a partir de dos caracteres inicia busqueda 
			$("#autocomplete").fadeIn(50);
			ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
			ul.listview( "refresh" );
			$.getJSON( dbase, function( data ) {	// Muestra resultados de búsqueda
				$.each ( data , function(key, val){
					var episode 	= val["0"].toLowerCase();
					var uri 		= val["1"];
					var time 		= timeInS(val["2"]);
					var question	= val["3"].toLowerCase();
					var qnoaccent	= question.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
					var duration 	= timeInS(val["4"]);
					var end 		= parseInt(time)+parseInt(duration);
					$.each(multi, function(index, value){ // patrones de busqueda 
						var query = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // elimina acentos y tildes
						var topic = query.split(" ");
						if (query.length > 2) {
							if (checkTopics(topic, question) || episode.toLowerCase().includes(query) || checkTopics(topic, qnoaccent) || query == episodestr[0]+episode || query == episodestr[1]+episode || query == episodestr[2]+episode || query == episodestr[3]+episode) {
								var dataresult = {uri, time, end, question};
								if(!allresults.find(obj => obj.uri+obj.time == uri+time)){ // elimino resultados repetidos
									results++;
									html += '<li><a href="#" class="alltext" onclick="setPlayer(\''+uri+'\', \''+time+'\', \''+end+'\', \''+question+'\');">'+results+' Ep'+episode+' - '+question.toLowerCase()+' <span class="ui-li-count">'+duration+'s</span></a><a href="#AddPlaylist" data-rel="popup" data-transition="slide" onclick="setPlaylist(\''+uri+'\', \''+time+'\', \''+end+'\', \''+question+'\');">Agregar a Playlist</a></li>';
									allresults.push(dataresult);
								}
							}
						}
						if (query == "allq"){ // Lista de todas las preguntas,
							var dataresult = {uri, time, end, question};
							results++;
							html += '<li><a href="#" class="alltext" onclick="setPlayer(\''+uri+'\', \''+time+'\', \''+end+'\', \''+question+'\');">'+results+' Ep'+episode+' - '+question.toLowerCase()+' <span class="ui-li-count">'+duration+'s</span></a><a href="#AddPlaylist" data-rel="popup" data-transition="slide" onclick="setPlaylist(\''+uri+'\', \''+time+'\', \''+end+'\', \''+question+'\');">Agregar a Playlist</a></li>';
							allresults.push(dataresult);	
						}
					});
					
				})
				var alltoplist = "";
				jsonresult = JSON.stringify(allresults);
				if ( html != "") {
					alltoplist = '<li data-theme="b"><a href="#" id="playall" onclick="setAllToPlist();" style="text-align:center;">Agregar los '+results+' resultados a Playlist</a></li>';
				}
				ul.html( alltoplist + html );
				ul.listview( "refresh" );
				$('li').removeClass("ui-screen-hidden");
				ul.trigger( "updatelayout");
			});
		}
	});
	$("#iniciaP").click(function(){
		startPlaylist(1);
	});
	$("#resetP").click(function(){
		flushPlaylist();
	});

	// Búsqueda por URI

	if (pattern != null) {
		$("#suggest").val(pattern);
		$("#autocomplete").trigger("filterablebeforefilter");
		waitElementRender();
	} else if (qmusic != null) {
		tipocue = "noctx";
		$("#suggest").val(qmusic);
		$("input[type=radio][name=tipocue]").filter('[value="artrol"]').prop("checked", false ).checkboxradio("refresh");
		$("input[type=radio][name=tipocue]").filter('[value="noctx"]').prop("checked", true ).checkboxradio("refresh");
		$("#autocomplete").trigger("filterablebeforefilter");
		waitElementRender();
	}
});

// Espera a que se forme el elemento para luego agregar a playlist, para cuando se hacen búsquedas por URI

function waitElementRender() { 
	if (!$("#playall").size()) {
		window.requestAnimationFrame(waitElementRender);
	} else {
		setAllToPlist();
	}
}


// Búsqueda por múltiples palabras (separadas por espacio)

function checkTopics(arr, target){
	return arr.every(i => target.includes(i));
}


// Reproducir player de youtube a un episodio y tiempo deseados

function setPlayer (uri, time, end, question) {
	startP = 0; 
	cancelStop();
	stopVideo();
	player.loadVideoById({'videoId': uri,
						  'startSeconds': time,
						  'endSeconds': end});
	var fadeoutime = (parseInt(end)-parseInt(time))*1000;
	$("#suggest").val("");
	$("#autor").html(question).show();
	$("#autor").fadeOut(fadeoutime);
	$("#autocomplete").fadeOut(200);
}


// Agregar elementos a la playlist

var playlist = [];
var playlistdata = [];
function setPlaylist (uri, time, end, question) {
	
	var renglon = parseInt($("#numrows").val())+parseInt(1);
	var duration = parseInt(end)-parseInt(time);
	$("#numrows").val(renglon);
	$("#playlistControls").show();
	$("#playlist").show();
	$("tbody").append('<tr id="line'+renglon+'"><th>'+renglon+'</th><td><a href="#" onclick="startPlaylist(\''+renglon+'\');">'+question+'</a></td><td>'+duration+'[s]</td></tr>');
	var fadepop = setTimeout(function(){ $("#AddPlaylist").popup("close"); }, 800);
	playlist.push(uri);
	playlistdata.push({"uri": uri, "time": time, "end": end, "question": question});
	showDuration();
}

// Agregar todos los elementos de una búsqueda a la playlist

var jsonresult = null;
function setAllToPlist () {
	var jsonobject = JSON.parse(jsonresult);
	$.each( jsonobject, function( key, value ) {
		setPlaylist(value["uri"], value["time"], value["end"], value["question"]);
	});
	$("#autocomplete").fadeOut(200);
}


// Tiempo total de la playlist 

function showDuration(){
	var total = 0;
	for (let i=0;i<playlistdata.length;i++) {
		total += parseInt(playlistdata[i].end)-parseInt(playlistdata[i].time);
	}
	$("#duration").html("Duración <b>"+timeInHms(total)+"</b>");
}


//Inicializa la reproducción de la playlist

function startPlaylist(numcue) {
	console.log("clickbuttonplist");
	cancelStop();
	stopVideo();
	startP = 1;
	var currentplay = parseInt(player.getPlaylistIndex())+1;
	$("#line"+currentplay+"").css({"background-color":"", "color":""}); // elimina el estilo resalatado de la reproducción anterior
	player.cuePlaylist(playlist, parseInt(numcue)-1);
	$("#autocomplete").fadeOut(200);
}


// Borra la playlist

function flushPlaylist() {
	$("#numrows").val(0);
	$("tbody").html("");
	$("#autocomplete").fadeOut(200);
	$("#duration").html("Duración");
	
	stopVideo();
	cancelStop();
	startP = 0;
	delete stoptime;
	playlist = [];
	playlistdata = [];
}


// Inicialización de la api del player de youtube 

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


var player;
function onYouTubeIframeAPIReady() {
	var jsonFile = 'js/artrol.json?nocache=' + (new Date()).getDay(); // recarga el archivo json cada día
	var lastEpisode = "";
	$.getJSON( jsonFile, function( data ){
		player = new YT.Player('player', {
			height: '100%',
			width: '100%',
			videoId: data[0][1], // Obtengo el Id del video más reciente
			playerVars: {
				rel: '0',
				color: 'white',
				controls: '0',
				disablekb: '1'
			 },
			events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange
			}
		});
	});	
}

function onPlayerReady(event) {
	// Cuando se hacen busquedas por URI, inicializa la reproducción automática.
	if (pattern != null || qmusic != null) {
		if (playlist.length > 0) {
			startPlaylist(1);
		}
	}
}


// Interacciones de las reproducciones vía playlist (startP != 0) a los cambios de estado del player de Youtube, consultar la api para referencias https://developers.google.com/youtube/iframe_api_reference

function onPlayerStateChange(event) {
	var currentindex = event.target.getPlaylistIndex();
	const noPlaying = -1;
	//const ended = 0;
	const playing = 1;
	const paused = 2;
	//const buffer = 3;
	const cued = 5;
	
	console.log("playerstate "+player.getPlayerState()+"- index "+player.getPlaylistIndex()+"- startP="+startP+" stoptime="+(parseInt(playlistdata[currentindex].end)-parseInt(playlistdata[currentindex].time))*1000);

	if (startP == 0) { // Cuando acaba de reproducir un item de la playlist
		if (currentindex == playlist.length-1) { // ultimo de la playlist
			console.log("ultimo"+currentindex+" - "+(playlist.length-1));
			startP = 100;
			event.target.stopVideo();
		} else {
			if (player.getPlayerState() == cued || player.getPlayerState() == noPlaying) {
				console.log("nextvideo");
				$("#line"+parseInt(currentindex+1)+"").css({"background-color":"", "color":""}); // quito resaltado al continuar con nuevo elemento de playlist
				event.target.nextVideo();
				startP = 1;	
			}
		}
	}

	if (startP == 1) { // Cuando se acaba de agregar un cue en playlist
		event.target.playVideo();
		if (player.getPlayerState() == playing) {
			$("#autor").html(playlistdata[currentindex].question).show();
			$("#autor").fadeOut((parseInt(playlistdata[currentindex].end)-parseInt(playlistdata[currentindex].time))*1000);
			$("#line"+parseInt(currentindex+1)+"").css({"background-color":"#171717", "color":"#ff1100"}); // resalto renglon en reproducción en playlist
			event.target.seekTo(playlistdata[currentindex].time);
			startP = 2;
		} 
	}
	
	if (startP == 2) { // Cunado se está reproduciendo un item de la playlist
		if (player.getPlayerState() == playing) {
			if (typeof stoptime !== 'undefined') {
				stoptime.clear();
			}
			stoptime = new Timer(stopVideo, (parseInt(playlistdata[currentindex].end)-parseInt(playlistdata[currentindex].time))*1000); // temporizador para detener la pregunta
		}
		if (player.getPlayerState() == noPlaying) { // Evita errores cuando YT entra en buffer o en estado de noPlaying
			console.log("Buffering...");
			startP = 1;	
		}
				
	}  
		
	if (startP != 0 && typeof stoptime !== 'undefined' && event.data == paused) { // Cuando se pone en pausa el video, el temporizador tambien se pone en pausa
		stoptime.pause();
		startP = 3;
	}

	if (startP == 3 && event.data == playing) { // Reinicia el temporizador cuando se quita la pausa del video
		stoptime.resume();
		startP = 2;
	} 
}


// Detener reproducción.

function stopVideo() {
	if (typeof player !== 'undefined') {
		player.stopVideo();
		startP = 0;
	}
}


// Cancelar el Timer que detiene la reproducción. Solo se usa en reproducciones desde playlist

function cancelStop(){
	if (typeof stoptime !== 'undefined') {
		stoptime.clear();
	}
	if($("#autor").is(':animated')) {
		$("#autor").stop().animate({opacity:'100'});
	}
	$("#autor").html("&nbsp;");
}


// Cambia el tiempo en formato hh:mm:ss a tiempo en milisegundos

function timeInS(time) {
	var standardTime = time.split(":");
	var s = (parseInt(standardTime[0])*3600) + (parseInt(standardTime[1])*60) + (parseInt(standardTime[2]));
	return s; 
}


// Cambia el tiempo en segundos a formato hh:mm:ss

function timeInHms(inseconds){
	var oneDay=86400;
	var days = 0;
	var measuredTime = new Date(null);
	var label = "D";
	while (inseconds >= oneDay) {
		inseconds -= oneDay;
	days++;
	}
	measuredTime.setSeconds(inseconds); // el valor en segundos
	return days+label+measuredTime.toISOString().slice(11, 19);
	
}


// Redefine el setTimout con la propiedad de ser pausado y retomado, Solo se usa en reproducciones desde playlist.

var Timer = function(callback, delay) {
    var timerId, start, remaining = delay;

    this.clear = function () {
        clearTimeout(timerId);
    };

    this.pause = function() {
        this.clear();
        remaining -= Date.now() - start;
    };

    this.resume = function() {
        start = Date.now();
        this.clear();
        timerId = setTimeout(callback, remaining);
    };

    this.resume();
};
