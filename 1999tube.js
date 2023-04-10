
let history=[] ;

const corsproxy = "https://corsproxy.io/?" ;
const corsproxy2 ="https://api.allorigins.win/raw?url=";
const flaskserver="https://putyourserver.here" ;

// Obtener el botón y el menú
const serverBtn = document.getElementById("serverBtn");
const serverMenu = document.getElementById("serverMenu");

// Variables globales para la URL del servidor y el valor de búsqueda
let serverUrl = "http://riitube.rc24.xyz/wiimc/?q=";
let searchText = "";

// Mostrar u ocultar el menú desplegable al hacer clic en el botón
function showServerMenu() {
  serverMenu.style.display = (serverMenu.style.display === "block") ? "none" : "block";
}

// Establecer el servidor seleccionado y cerrar el menú
function setServer(server) {
  // Actualizar la URL del servidor
  if (server === "YouTube") {
    serverUrl = "http://riitube.rc24.xyz/wiimc/?q=";
  } else if (server === "vimeo") {
    serverUrl = "http://riitube.rc24.xyz/wiimc/vimeo/?q=";
  } else if (server === "dailymotion"){
    serverUrl = "http://riitube.rc24.xyz/wiimc/dailymotion/?q=";
  }
  else if (server === "wiist"){
    serverUrl = flaskserver+"/show_deco?q=";
  }
  // Cerrar el menú
  serverMenu.style.display = "none";
}



function search() { const searchText = document.getElementById("searchText").value; 
const url = /^(http|https):\/\//.test(searchText) ? searchText : serverUrl + searchText;



  // If the URL is playable, play it
  if (isPlayable(url)) {
    playVideo(url);
  } else {

    if(is_flask()) {fixchino(url);} 
    

    if(is_proxy()) {xmlchino(corsproxy+url);} 
    else{xmlchino(url);} 
    
  }

  
history.push({ file: url, title: 'search: ' +searchText, length: 0 });


}



function isPlayable(url) {
const supportedExtensions = [ "3gp", "3g2", "aac", "aif", "asf", "avi", "divx", "flac", "flv", "m2v", "m4v", "midi", "mkv", "mov", "mp2", "mp3", "mp4", "mpe", "mpeg", "mpg", "oga", "ogg", "ogv", "opus", "qt", "ra", "ram", "rm", "swf", "ts", "vob", "wav", "webm", "wma", "wmv" ];
  

  const extension = url.split(".").pop();
  return supportedExtensions.includes(extension);
}


function xmlchino(url) {
  var playlist = [];
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var data = xhr.responseText;
        if (url.endsWith('.xml')) {
          playlist = parsePlaylistXml(data);
        } else {
          playlist = parsePlaylist(data);
        }
        if (playlist.length > 0) {
          showPlaylist(playlist);
         /* alert('done');*/
        } else {
          /*alert('...');*/
        }
      } else {
        /*alert('Error al buscar la lista de reproducción');*/
      }
    }
  };
  xhr.open('GET', url, true);
  xhr.send();
}


function fixchino(url) {
  try {
   decoinserver(url);
   
  
  } catch (error) {
    console.error(error);
    Materialize.toast('Error loading playlist', 4000);
  }
}


function decoinserver(url) {
  return new Promise(function(resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', flaskserver+'/deco');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'text';
    xhr.onload = function() {
      if (xhr.status === 200) {
        resolve(xhr.responseText);
      } else {
        reject(new Error('Request failed. Status code: ' + xhr.status));
      }
    };
    xhr.onerror = function() {
      reject(new Error('Request failed'));
    };
    xhr.send('link=' + encodeURIComponent(url));
  });
}





  
function parsePlaylist(data) {
  const lines = data.split("\n");
  const playlist = [];

  let currentFile = null;
  let currentTitle = null;
  let currentLength = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("#EXTINF")) {
      currentTitle = line.substring(line.indexOf(",") + 1);
      currentLength = 0;
    } else if (line.startsWith("http")) {
      currentFile = line;
      playlist.push({ file: currentFile, title: currentTitle, length: currentLength });
      currentFile = null;
      currentTitle = null;
      currentLength = null;
    } else if (line.startsWith("File")) {
      currentFile = line.substring(line.indexOf("=") + 1);
    } else if (line.startsWith("Title")) {
      currentTitle = line.substring(line.indexOf("=") + 1);
    } else if (line.startsWith("Length")) {
      currentLength = line.substring(line.indexOf("=") + 1);
      playlist.push({ file: currentFile, title: currentTitle, length: currentLength });
      currentFile = null;
      currentTitle = null;
      currentLength = null;
    }
  }
  
  return playlist;
	
}
  

function parsePlaylistXml(data) {
  const playlist = [];
  const regex = /<link\s+name="([^"]+)"\s+addr="([^"]+)"/g;
  let match;

  while ((match = regex.exec(data)) !== null) {
    const title = match[1];
    const url = match[2];
    playlist.push({ file: url , title: title, length: 0 });
  }

  return playlist;
}

function parsePlaylistCrazy(str) {
  const regex = /https?:\/\/[^\s]+/g;
  const urls = str.match(regex);
  if (!urls) {
    return [];
  }
  return urls.filter(url => url.startsWith("http")).map(url => {
    return { file: url, title: url, length: 0 };
  });
}




function showPlaylist(playlist) {
  const tbody = document.getElementById("playlist").getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";

  for (let i = 0; i < playlist.length; i++) {
    const item = playlist[i];
    const row = document.createElement("tr");
    const titleCell = document.createElement("td");
    const lengthCell = document.createElement("td");

    titleCell.textContent = item.title;

    const duration = new Date(item.length * 1000).toISOString().substr(11, 8);
    lengthCell.textContent = duration;

    row.appendChild(titleCell);
    row.appendChild(lengthCell);

    row.onclick = function() {
      history.push({ file: item.file , title: item.title, length: 0 });
      playVideo(item.file);
      highlightRow(row);
    };

    tbody.appendChild(row);
  }
}

function highlightRow(row) {
  const rows = document.getElementById("playlist").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    row.classList.remove("selected");
  }
  row.classList.add("selected");
}




      
  
 

function playVideo(file) {
  let videoPlayer = document.getElementById("videoPlayer");
  let videoSource = document.getElementById("videoSource");

         xmlchino(corsproxy+file); 
         xmlchino(corsproxy2+file); 
	   	 if(is_flask()) {fixchino(file);}
    		 xmlchino(file); 


  if (is_proxy()) {
    if (videoPlayer.tagName === "VIDEO") {
      videoSource.setAttribute("src", corsproxy+file);
      videoPlayer.load();
      videoPlayer.play();
    } else if (videoPlayer.tagName === "EMBED") {
      videoPlayer.setAttribute("src", corsproxy+file);
    }
  } else {
    if (videoPlayer.tagName === "VIDEO") {
      videoSource.setAttribute("src", file);
      videoPlayer.load();
      videoPlayer.play();
    } else if (videoPlayer.tagName === "EMBED") {
      videoPlayer.setAttribute("src", file);
    }
  }
  
  Materialize.toast('playing', 400);
  



window.onerror = function() {
  Materialize.toast('error desconocido', 4000);
  
};



  
  
}

 
function showhistory() {

try{
showPlaylist(history) ;

} catch (error) {
    console.error(error);
    Materialize.toast('Error loading history', 4000);
}

}


function is_proxy() {
const switchElement = document.getElementById("proxySwitch");
return switchElement.checked;

}

function is_flask() {
const switchElement = document.getElementById("pySwitch");
return switchElement.checked;

}

 