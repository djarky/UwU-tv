var history=[] ;

var corsproxy = "https://corsproxy.io/?" ;
var corsproxy2 ="https://api.allorigins.win/raw?url=";
var flaskserver="https://putyourserver.here" ;



// Obtener el bot?n y el men?
var serverBtn = document.getElementById("serverBtn");
var serverMenu = document.getElementById("serverMenu");

// Variables globales para la URL del servidor y el valor de b?squeda
var serverUrl = "http://riitube.rc24.xyz/wiimc/?q=";
var searchText = "";

// Mostrar u ocultar el men? desplegable al hacer clic en el bot?n
function showServerMenu() {
  if (serverMenu.style.display === "block") {
    serverMenu.style.display = "none";
  } else {
    serverMenu.style.display = "block";
  }
}

// Establecer el servidor seleccionado y cerrar el men?
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
  // Cerrar el men?
  serverMenu.style.display = "none";
}




function search() {
  const searchText = document.getElementById("searchText").value; 
  const url = /^(http|https):\/\//.test(searchText) ? searchText : serverUrl + searchText;
  var playable = isPlayable(url);

  if (playable) {
    playVideo(url);
  } else {
    if (is_flask()) {
      fixchino(url);
    }

    if (is_proxy()) {
      xmlchino(corsproxy + url);
    } else {
      xmlchino(url);
    }

    
  }
}

function isPlayable(url) {
  const supportedExtensions = [ "3gp", "3g2", "aac", "aif", "asf", "avi", "divx", "flac", "flv", "m2v", "m4v", "midi", "mkv", "mov", "mp2", "mp3", "mp4", "mpe", "mpeg", "mpg", "oga", "ogg", "ogv", "opus", "qt", "ra", "ram", "rm", "swf", "ts", "vob", "wav", "webm", "wma", "wmv" ];
  
  var parts = url.split(".");
  var extension = parts[parts.length - 1];
  return supportedExtensions.indexOf(extension) !== -1;
}



function fixchino(url) {
  try {
    decoinserver(url);
  } catch (error) {
    alert(error);
    alert('Error loading playlist');
  }
}

function decoinserver(url) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', flaskserver+'/deco');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.responseType = 'text';
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        alert(xhr.responseText);
      } else {
        alert('Request failed. Status code: ' + xhr.status);
      }
    }
  };
  xhr.send('link=' + encodeURIComponent(url));
}


function parsePlaylist(data) {
  const lines = data.split("\n");
  const playlist = [];

  var currentFile = null;
  var currentTitle = null;
  var currentLength = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.indexOf("#EXTINF") === 0) {
      currentTitle = line.substring(line.indexOf(",") + 1);
      currentLength = 0;
    } else if (line.indexOf("http") === 0) {
      currentFile = line;
      playlist.push({ file: currentFile, title: currentTitle, length: currentLength });
      currentFile = null;
      currentTitle = null;
      currentLength = null;
    } else if (line.indexOf("File") === 0) {
      currentFile = line.substring(line.indexOf("=") + 1);
    } else if (line.indexOf("Title") === 0) {
      currentTitle = line.substring(line.indexOf("=") + 1);
    } else if (line.indexOf("Length") === 0) {
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
  var playlist = [];
  var regex = /<link\s+name="([^"]+)"\s+addr="([^"]+)"/g;
  var match;

  while ((match = regex.exec(data)) !== null) {
    var title = match[1];
    var url = match[2];
    playlist.push({ file: url , title: title, length: 0 });
  }

  return playlist;
}







function showhistory() {
  try {
    showPlaylist(history);
  } catch (error) {
    console.error(error);
    alert('Error loading history');
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
        /*alert('Error al buscar la lista de reproducci?n');*/
      }
    }
  };
  xhr.open('GET', url, true);
  xhr.send();
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
