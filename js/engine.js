/*
*
* YoutubeSearch
* Desarrollado: Luis Mendoza @lugerius
* js/engine.js Contiene el motor de busqueda y las funciones necesarias para generar playlist
*
*/

$(function() {
	flushPlaylist();
	$("#suggest").focus(function(){
		$("#suggest").val("");
		$("#autocomplete").fadeOut(200);
	});
	$("#playerContainer").mouseenter(function(){
		$("#autocomplete").fadeOut(200);
	});
	$("#playerContainer").on("tap",function(){
		$("#autocomplete").fadeOut(200);
	});
		
	$( "#autocomplete" ).on( "filterablebeforefilter", function ( e, data ) {
		var ul = $( this );
		var query = $("#suggest").val().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");	// elimina acentos y tildes
		var dbase = 'js/artrol.json?nocache=' + (new Date()).getDay(); // obtiene el archivo json cada día
		var episodestr = ['ep','episodio','ep-','episodio-'];	// Para búsqueda por episodio
		var html = "";
		var results = 0; // contador de resultados
		var allresults = [];
		ul.html( "" );
		if ( query && query.length > 2 ) {	// A partir de dos caracteres inicia busqueda 
			$("#autocomplete").fadeIn(50);
			ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
			ul.listview( "refresh" );
			$.getJSON( dbase, function( data ) {	// Muestra resultados de búsqueda
				$.each ( data , function(key, val){
					var episode 	= val["0"];
					var uri 		= val["1"];
					var time 		= timeInS(val["2"]);
					var question	= val["3"].toLowerCase();
					var qnoaccent	= question.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
					var topic		= query.split(" ");
					var duration 	= timeInS(val["4"]);
					var end 		= parseInt(time)+parseInt(duration);
					if (checkTopics(topic, question) || episode.includes(query) || query == episodestr[0]+episode || query == episodestr[1]+episode || query == episodestr[2]+episode || query == episodestr[3]+episode || qnoaccent.includes(query)) {
						var dataresult = {uri, time, end, question};
						results++;
						html += '<li><a href="#" class="alltext" onclick="setPlayer(\''+uri+'\', \''+time+'\', \''+end+'\', \''+question+'\');">'+results+' Ep'+episode+' - '+question.toLowerCase()+' <span class="ui-li-count">'+duration+'s</span></a><a href="#AddPlaylist" data-rel="popup" data-transition="slide" onclick="setPlaylist(\''+uri+'\', \''+time+'\', \''+end+'\', \''+question+'\');">Agregar a Playlist</a></li>';
						allresults.push(dataresult);
					}
				})
				jsonresult = JSON.stringify(allresults);
				if ( html != "") {
					alltoplist = '<li data-theme="b"><a href="#" onclick="setAllToPlist();" style="text-align:center;">Agregar los '+results+' resultados a Playlist</a></li>';
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
});


// Búsqueda por múltiples palabras

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
	$("tbody").append('<tr><th>'+renglon+'</th><td class="title"><a href="#" onclick="startPlaylist(\''+renglon+'\');">'+question+'</a></td><td>'+duration+'[s]</td></tr>');
	var fadepop = setTimeout(function(){ $("#AddPlaylist").popup("close"); }, 800);
	playlist.push(uri);
	playlistdata.push({"uri": uri, "time": time, "end": end, "question": question});
	showDuration();
}

// Agregar todos los elementos de una búsqueda a la playlist

function setAllToPlist () {
	jsonobject = JSON.parse(jsonresult);
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

function startPlaylist (numcue) {
	cancelStop();
	stopVideo();
	player.cuePlaylist(playlist, parseInt(numcue)-1);
	player.playVideoAt(parseInt(numcue)-1);
	startP = 1;
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
	player = new YT.Player('player', {
		height: '100%',
		width: '100%',
		videoId: 'O4eOYFkVb-g',
		playerVars: {
			rel: '0',
			color: 'white',
			controls: '0',
			disablekb: '1'
 		},
		events: {
		 	'onStateChange': onPlayerStateChange
		}

	});merca
}


// Interacciones de las reproducciones vía playlist (startP != 0) a los cambios de estado del player de Youtube, 

function onPlayerStateChange(event) {
	if (startP == 2 && event.data == YT.PlayerState.CUED) {
		
		if (event.target.getPlaylistIndex() == playlist.length-1) {
			delete startP;
			event.target.stopVideo();
		} else {
			if ((event.target.getPlaylist()).length !== playlist.length) {
				startPlaylist(parseInt(event.target.getPlaylistIndex())+2);
			} else {
				event.target.nextVideo();
				startP = 1;	
			}		
		}
	} else if (startP == 2 && event.data == YT.PlayerState.PLAYING){
		stoptime = new Timer(stopVideo, (parseInt(playlistdata[event.target.getPlaylistIndex()].end)-parseInt(playlistdata[event.target.getPlaylistIndex()].time))*1000);
	} else if (startP == 1 && (event.data == -1 || event.data == 5) ) {
		event.target.playVideo();
	} else if (startP == 1 && event.data == YT.PlayerState.PLAYING){
		$("#autor").html(playlistdata[event.target.getPlaylistIndex()].question).show();
		$("#autor").fadeOut((parseInt(playlistdata[event.target.getPlaylistIndex()].end)-parseInt(playlistdata[event.target.getPlaylistIndex()].time))*1000);
		startP = 2;
		event.target.seekTo(playlistdata[event.target.getPlaylistIndex()].time);
	} else if (startP != 0 && typeof stoptime !== 'undefined' && event.data == YT.PlayerState.PAUSED) {
		stoptime.pause();
		startP = 3;
	} else if (startP == 3 && YT.PlayerState.PLAYING) {
		stoptime.resume();
		startP = 2;
	}
	//console.log("playerstate "+player.getPlayerState()+"- index "+player.getPlaylistIndex()+"- startP="+startP);	
}


// Detener reproducción.

function stopVideo(){
	if (typeof player !== 'undefined') {
		player.stopVideo();
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
	var measuredTime = new Date(null);
	measuredTime.setSeconds(inseconds); // specify value of SECONDS
	return measuredTime.toISOString().substr(11, 8);
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
