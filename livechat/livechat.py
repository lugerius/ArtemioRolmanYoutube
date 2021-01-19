#!/usr/bin/env python3
#-*- coding: utf-8 -*-
#
#	Obtiene las preguntas de un chat en vivo de una transmisión de Youtube
#	
#	REQUISITOS:
#
#	
#	Requiere de obtener una api key de google en https://console.developers.google.com/apis/api/youtube.googleapis.com
#	Requiere que se obtenga el id del canal de Youtube
# 	Requiere de las librerías de python json, time, requests, dateutil, sys, datetime, os
#
# USO: 
#	livechat.py [YOUTUBECHANNELID] [GOOGLEAPIKEY] [CAPTURESTRING] [*CHANNELID]


import json
import time
import requests
import os
import dateutil.parser as dp
import re
from sys import argv
from datetime import date



# 
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
			finish()


# 
#	Función para obtener el liveChatId de la transmision
#

def get_livechatid(videoId, apiKey):
	liveChatId = requests.get("https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id="+videoId+"&key="+apiKey)
	data = liveChatId.json()
	if "activeLiveChatId" in data["items"][0]["liveStreamingDetails"]:
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
		os.unlink("../../tmp/livechat.pid")
		os.rename("listapreguntas.csv", "listapreguntas"+str(date.today())+".csv")
		exit()
	except:
		exit()
	

# 
#	Función que busca nuevos mensajes cada determinado tiempo
#

def listen_message(initTime, duration, delayTime, liveChat, apiKey):
	filePath = "listapreguntas.csv"
	lastRead = 0
	newTime = 0
	endTime = initTime+duration
	while initTime < endTime:
		initTime += delayTime
		for dataMessage in get_chat(liveChat, apiKey):
			pregunta = dataMessage["snippet"]["displayMessage"].lower()
			if pregunta.count(argv[3]) > 0:
				publishedAt = dp.parse(dataMessage["snippet"]["publishedAt"])
				newTime = publishedAt.strftime("%s")
				if lastRead < int(newTime):
					outq = '"'+remove_quotes(dataMessage["authorDetails"]["displayName"])+'","'+remove_quotes(dataMessage["snippet"]["displayMessage"])+'","'+dataMessage["snippet"]["publishedAt"]+'"\n'
					csvFile = open(filePath, "a")
					csvFile.write(outq)
					csvFile.close()
					lastRead = int(newTime)
		time.sleep(delayTime)			


#
#	Función para remover comillas dobles dentro de una cadena
#

def remove_quotes(originalstring):
	newString = originalstring.replace('"',"'")
	hashTag = re.compile(argv[3], re.IGNORECASE)
	newString  = hashTag.sub("", newString)
	return newString

#
# Principal
#

# Verifico que no se esté ejecutando el script para esta misma transmisión de youtube

if __name__ == "__main__":
	pid = str(os.getpid())
	runningPid = "../../tmp/livechat.pid"

	if os.path.isfile(runningPid):
		print("Hay un proceso ya ejecutandose")
		exit()
	open(runningPid, "w").write(pid)
	if len(argv)<3:
		print("Use: livechat.py [YOUTUBETCHANNELID] [GOOGLEAPIKEY] [CAPTURESTRING] [*CHANNELID]")
	else:
		channel = argv[1]
		key = argv[2]
		initTime = time.time()
		duration = 18000
		delayTime = 90
		try:
			vidid = get_broadcastid(channel, key)
			liveChat = get_livechatid(vidid, key)
			listen_message(int(initTime), duration, delayTime, liveChat, key)
		except:
			finish()

