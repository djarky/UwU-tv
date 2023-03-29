from flask_cors import CORS
from flask import Flask, Response, request
import requests

import youtube_dl

from threading import Thread
from bs4 import BeautifulSoup
import re

app = Flask('')
CORS(app)

playlist =""

@app.route('/')
def home():
    return "Meow!! I'm alive"

def run():
    app.run(host='0.0.0.0',port=8080)

def keep_alive():  
    t = Thread(target=run)
    t.start()

  
def generate_m3u_yt(link):
    # Configurar opciones de youtube-dl
    ydl_opts = {}

    # Descargar información del video
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(link, download=False)

    # Obtener los enlaces de los diferentes formatos
    formats = info_dict.get('formats', [])
    media_urls = [f.get('url', '') for f in formats if f.get('url', '')]

    # Construir la lista M3U
    m3u_content = '#EXTM3U\n'
    m3u_content += f'#EXTINF:-1,{info_dict.get("title", "")}\n{media_urls[0]}\n'

    return m3u_content

  
##
def generate_m3u(link):
    m3u_content = '#EXTM3U\n'
    m3u_content+=f'#EXTINF:-1,original link\n{link}\n'
    return m3u_content  

##

##
def deco_m3u(link):
    response = requests.get(link)
    content = response.content.decode('utf-8')
    soup = BeautifulSoup(content, 'html.parser')


    return str(soup)

##


def generate_m3u_urls(link):
    # Hacer solicitudes GET al enlace y analizar el contenido para obtener la lista de reproducción
    response = requests.get(link)
    content = response.content.decode('utf-8')
    soup = BeautifulSoup(content, 'html.parser')

    media_urls = []
    for link in soup.find_all('a', href=True):
        url = link['href']
        media_urls.append(url)

    # Construir la lista M3U
    m3u_content = '#EXTM3U\n'
    
    for url in media_urls:
        m3u_content += f'#EXTINF:-1,{url}\n{url}\n'
    return m3u_content
  
##
def generate_m3u_url_media(link):
    # Hacer solicitudes GET al enlace y analizar el contenido para obtener la lista de reproducción
    response = requests.get(link)
    content = response.content.decode('utf-8')
    soup = BeautifulSoup(content, 'html.parser')

    # Buscar todos los enlaces de audio y video en la página
    media_urls = []
    for link in soup.find_all('a', href=True):
        url = link['href']
        if re.match(r'.*\.(mp3|mp4|wav|avi|mkv|mov|m3u)$', url):
            media_urls.append(url)

    # Construir la lista M3U
    m3u_content = '#EXTM3U\n'
    
    for url in media_urls:
        m3u_content += f'#EXTINF:-1,{url}\n{url}\n'
    return m3u_content

  
  
##
@app.route('/generate_playlist', methods=['POST'])
def generate_playlist():
    link = request.form['link']
    playlist = generate_m3u(link)
    print(playlist)
    with open("playlist.txt", "w") as f:
     f.write (playlist)
    return Response(playlist, mimetype='audio/x-mpegurl')

##
@app.route('/show_playlist')
def show_playlist():
    with open("playlist.txt", "r") as f:
     playlist=f.read()  
    print(playlist)    
    return Response(playlist, mimetype='audio/x-mpegurl')

##
@app.route('/show_raw_playlist')
def show_raw_playlist():
    with open("playlist.txt", "r") as f:
        playlist=f.read()  
    return Response(playlist, mimetype='text/plain')


##
@app.route('/deco', methods=['POST'])
def decode_playlist():
    link = request.form['link']
    playlist = deco_m3u(link)
    with open("deco.txt", "w") as f:
     f.write (playlist)
    return Response(playlist, mimetype='text/plain')

##

@app.route('/show_deco')
def show_deco_playlist():
    with open("deco.txt", "r") as f:
        playlist=f.read()  
    return Response(playlist, mimetype='text/plain')


##
keep_alive()
