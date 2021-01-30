#!/usr/bin/env python3
#-*- coding: utf-8 -*-
#
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
#	livechat/livechat.py: 	Obtiene las preguntas de un chat en vivo de una transmisión de Youtube con espejo en Twitch
#							Se ejecuta del lado del servidor y solamente genera un archivo CSV que después es leído
# 							por livechat/index.html. En el servidor cambiar los permisos de este archivo a 0700
#	
# 	REQUISITOS:
#
#	Requiere de una api key de google que se obtiene en https://console.developers.google.com/apis/api/youtube.googleapis.com
#	Requiere que se obtenga el id del canal de Youtube
# 	Requiere de las librerías de python json, time, requests, dateutil, sys, datetime, os
#	Para la captura del chat de Twitch se requiere del archivo twitchchat.js en el mismo directorio de trabajo
#	Para automatizar la búsqueda de streams en vivo del canal de youtube, se debe agregar la ejecución de este script a un cronjob en el servidor
#	Ej. ./livechat.py UCEh5UPBv0alseI62OJhnKow GOOGLEAPIKEY "#pregunta" artemiourbina 
#
# 	USO:
#
#	livechat.py [YOUTUBECHANNELID] [GOOGLEAPIKEY] [CAPTURESTRING] [\"CAPTURESTRING\"] [*TWITCHCHANNEL]
#
#	[*TWITCHCHANNEL] - No es obligatorio si solo se quiere capturar de youtube


import json
import time
import requests
import os
import subprocess
import dateutil.parser as dp
import re
from sys import argv
from datetime import date

os.chdir(os.path.dirname(argv[0]))

""" # 
#	Función para saber si el canal está transmitiendo en vivo
#

def get_broadcastid(channelId, apiKey):
	if len(argv) == 5: # Si conocemos el id del stream en vivo
		return argv[4] 
	else:
		videoId = requests.get("https://www.googleapis.com/youtube/v3/search?eventType=live&part=id&channelId="+channelId+"&type=video&key="+apiKey)
		data = videoId.json()
		try:
			return data["items"][0]["id"]["videoId"]
		except:
			print("No existe transmisión en vivo")
			finish() """

# 
#	Función alternativa para saber si el canal está transmitiendo en vivo, no requiere apikey (No consume cuota)
#

def get_altbroadcastid(channelId):
	ytfile = requests.get("https://www.youtube.com/channel/"+channelId+"/live")
	match = re.search('"videoId":"(.*)","broadcastId"', ytfile.text)

	if match:
		videoid = match.group(1)
		print("Livestream encontrado VideoID: "+videoid)
		return videoid
	else:
		print("No hay transmision en vivo")
		finish()


# 
#	Función para obtener el liveChatId de la transmision
#

def get_livechatid(videoId, apiKey):
	liveChatId = requests.get("https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id="+videoId+"&key="+apiKey)
	data = liveChatId.json()

	if "activeLiveChatId" in data["items"][0]["liveStreamingDetails"]:
		print("Livechat encontrado ID:"+data["items"][0]["liveStreamingDetails"]["activeLiveChatId"])
		return data["items"][0]["liveStreamingDetails"]["activeLiveChatId"]
	else:
		print("No hay chat en vivo disponible")
		finish()

# 
#	Función para obtener los mensajes del chat de la transmision
#

def get_chat(liveChatId, apiKey):
	chat = requests.get("https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId="+liveChatId+"&part=id,snippet,authorDetails&maxResults=2000&key="+apiKey)
	data = chat.json()

	if "items" in data:
		return data["items"]
	else:
		print("No hay mensajes en el chat o ya no hay chat disponible")
		finish()


# 
#	Función de salida
#

def finish():
	try:
		os.unlink("/tmp/livechat.pid")

		if os.path.isfile("listapreguntas.csv"):
			os.rename("listapreguntas.csv", "listapreguntas"+str(date.today())+".csv")
			print("Renombrando archivo listapreguntas.csv a listapreguntas"+str(date.today())+".csv")

		if twpid != 0:
			os.kill(twpid, 9)
			print("Terminando la captura de chat de twitch")

		exit()
	except Exception as e:
		print(e)
		exit()
	

# 
#	Función que busca nuevos mensajes cada determinado tiempo
#

twpid = 0
def listen_message(delayTime, liveChat, apiKey):
	global twpid

	if len(argv) == 5:
		twitchlive = ['node', 'twitchchat.js', argv[4], argv[3]]
		nodechild = subprocess.Popen(twitchlive)
		twpid = nodechild.pid
		print("ejecutando captura de chat de twitch en pid: "+str(twpid))
	else:
		print("capturando solamente el chat de youtube")

	filePath = "listapreguntas.csv"
	lastRead = 0
	newTime = 0

	while True:
		for dataMessage in get_chat(liveChat, apiKey):
			pregunta = dataMessage["snippet"]["displayMessage"].lower()
			if pregunta.count(argv[3]) > 0:
				publishedAt = dp.parse(dataMessage["snippet"]["publishedAt"])
				newTime = publishedAt.strftime("%s")
				if lastRead < int(newTime):
					outq = '"YT-'+remove_quotes(dataMessage["authorDetails"]["displayName"])+ \
						   '","'+remove_quotes(dataMessage["snippet"]["displayMessage"])+ \
						   '","'+dataMessage["snippet"]["publishedAt"]+'"\n'
					csvFile = open(filePath, "a")
					csvFile.write(outq)
					csvFile.close()
					lastRead = int(newTime)

		try:
			time.sleep(delayTime)
		except:
			finish()	


#
#	Función para remover comillas dobles dentro de una cadena
#

def remove_quotes(originalstring):
	banned = {	'\"': '-',
					'\'': '-',
					'<': '&lt;',
					'>': '&gt;',
					'|': ''	}
	newString = originalstring.replace('&',"&amp;")

	for oldItem, newItem in banned.items():
		newString = newString.replace(oldItem ,newItem)
	
	pattern = re.escape(argv[3]) # Quita el patrón de búsqueda del texto
	hashTag = re.compile(pattern, re.IGNORECASE)
	newString  = hashTag.sub("", newString)
	return newString

#
# Principal
#

if __name__ == "__main__":
	pid = str(os.getpid())
	runningPid = "/tmp/livechat.pid"

	if os.path.isfile(runningPid):
		print("Hay un proceso ya ejecutandose")
		exit()

	open(runningPid, "w").write(pid)

	if len(argv)<4:
		print("Use: livechat.py [YOUTUBETCHANNELID] [GOOGLEAPIKEY] [\"CAPTURESTRING\"] [*TWITCHCHANNEL]")
		finish()
	else:
		channel = argv[1]
		key = argv[2]
		delayTime = 60

	try:
		vidid = get_altbroadcastid(channel)
		liveChat = get_livechatid(vidid, key)
		listen_message(delayTime, liveChat, key)
	except Exception as e:
		print(e)
		finish()