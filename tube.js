
let history=[] ;

const corsproxy = "https://corsproxy.io/?" ;
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
  else if (server === "py"){
    serverUrl = flaskserver+"/show_deco?q=";
  }
  // Cerrar el menú
  serverMenu.style.display = "none";
}



function search() { const searchText = document.getElementById("searchText").value; const url = /^(http|https):\/\//.test(searchText) ? searchText : `${serverUrl} ${searchText}`; 



  // If the URL is playable, play it
  if (isPlayable(url)) {
    playVideo(url);
  } else {
    fixchino(url);
    if(is_proxy()) {ferchino(corsproxy+url);} 
    else{ferchino(url);} 
    
  }

  
history.push({ file: url, title: 'search: ' +searchText, length: 0 });
/* playVideo(url); */

}



function isPlayable(url) {
const supportedExtensions = [ "3gp", "3g2", "aac", "aif", "asf", "avi", "divx", "flac", "flv", "m2v", "m4v", "midi", "mkv", "mov", "mp2", "mp3", "mp4", "mpe", "mpeg", "mpg", "oga", "ogg", "ogv", "opus", "qt", "ra", "ram", "rm", "swf", "ts", "vob", "wav", "webm", "wma", "wmv" ];
  

  const extension = url.split(".").pop();
  return supportedExtensions.includes(extension);
}




function ferchino(url) {
let playlist=[] ;
fetch(url)
    .then(response => response.text())
    .then(data => {

if (url.endsWith('.xml')) {
   playlist = parsePlaylistXml(data);
} 
else{
      playlist = parsePlaylist(data);
} 
      if (playlist.length > 0) {
        showPlaylist(playlist);
      	Materialize.toast('done', 1000);		    
      } else {
       Materialize.toast('... ', 800);
         
      }
    })
    .catch(error => {
      console.error("Error al buscar la lista de reproducción:", error);
   Materialize.toast('loading...', 4000); 
	  
    });

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
    return $.ajax({
    type: 'POST',
    url: flaskserver+'/deco',
    data: { link: url },
    dataType: 'text'
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
  const tbody = document.querySelector("#playlist tbody");
  tbody.innerHTML = "";

  playlist.forEach((item, index) => {
    const row = document.createElement("tr");
    const titleCell = document.createElement("td");
    const lengthCell = document.createElement("td");

    titleCell.textContent = item.title;

    const duration = new Date(item.length * 1000).toISOString().substr(11, 8);
    lengthCell.textContent = duration;

    row.appendChild(titleCell);
    row.appendChild(lengthCell);

    row.addEventListener("click", () => {
		history.push({ file: item.file , title: item.title, length: 0 });
      playVideo(item.file);
      highlightRow(row);
    });

    tbody.appendChild(row);
  });
}

function highlightRow(row) {
  const rows = document.querySelectorAll("#playlist tbody tr");
  rows.forEach(row => {
    row.classList.remove("selected");
  });
  row.classList.add("selected");
}





      


  
 
  
 


function playVideo(file) {
  const videoPlayer = document.getElementById("videoPlayer");
  const videoSource = document.getElementById("videoSource");

		
    
         ferchino(corsproxy+file); 
		   fixchino(file) ; 
    		ferchino(file); 


    if(is_proxy()) {
    videoSource.setAttribute("src", corsproxy+file);
    } else{
    videoSource.setAttribute("src", file);
    } 
    
    videoPlayer.load();
    videoPlayer.play();

    
	 Materialize.toast('playing', 400);
    


  

// Detectar el cambio de orientación del dispositivo
  window.addEventListener('orientationchange', () => {
    if (screen.orientation.type.startsWith('landscape')) {
      videoPlayer.requestFullscreen(); // Poner el elemento en pantalla completa
    } else {
      document.exitFullscreen(); // Salir de la pantalla completa si se cambia a orientación portrait
    }
 });


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