
let history=[] ;

const corsproxy = "https://corsproxy.io/?" ;
const corsproxy2 ="https://api.allorigins.win/raw?url=";
const torserver="https://torrents-api.ryukme.repl.co" ;

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
  if (server === "1337x") {
    serverUrl = "/api/1337x/";
  } else if (server === "yts") {
    serverUrl = "/api/yts/";
  } else if (server === "eztv"){
    serverUrl = "/api/eztv/";
  } else if (server === "Torrent Galaxy"){
    serverUrl = "/api/tgx/";
  } else if (server === "Torlock"){
    serverUrl = "/api/torlock/";
  } else if (server === "PirateBay"){
    serverUrl = "/api/piratebay/";
  } else if (server === "Nyaasi"){
    serverUrl = "/api/nyaasi/";
  } else if (server === "Rarbg"){
    serverUrl = "/api/rarbg/";
  } else if (server === "Ettv"){
    serverUrl = "/api/ettv/";
  } else if (server === "Zooqle"){
    serverUrl = "/api/zooqle/";
  } else if (server === "KickAss"){
    serverUrl = "/api/kickass/";
  } else if (server === "Bitsearch"){
    serverUrl = "/api/bitsearch/";
  } else if (server === "Glodls"){
    serverUrl = "/api/glodls/";
  } else if (server === "MagnetDL"){
    serverUrl = "/api/magnetdl/";
  } else if (server === "LimeTorrent"){
    serverUrl = "/api/limetorrent/";
  } else if (server === "TorrentFunk"){
    serverUrl = "/api/torrentfunk/";
  } else if (server === "TorrentProject"){
    serverUrl = "/api/torrentproject/";
  } else if (server === "all"){
    serverUrl = "/api/all/";
  }
  // Cerrar el menú
  serverMenu.style.display = "none";
}





function search() { const searchText = document.getElementById("searchText").value; 
const url = /^(http|https):\/\//.test(searchText) ? searchText :torserver + serverUrl + searchText;



  // If the URL is playable, play it
  if (isPlayable(url)) {
    playVideo(url);
  } else {

    
    

    if(is_proxy()) {ferchino(corsproxy+url);} 
    else{fetchJson(url);} 
    
  }

  
history.push({ file: url, title: 'search: ' +searchText, length: 0 });


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
      playlist = parsePlaylistCrazy(data);
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




function fetchJson(url) {
  let playlist = [];

  fetch(url)
    .then(response => response.json())
    .then(data => {
      // procesar el objeto JSON aquí
      playlist = parsePlaylistJSON(data);
      showPlaylist(playlist);
    })
      .catch(error => {
      console.error("Error al buscar la lista de reproducción:", error);
   Materialize.toast('loading...', 4000); 
	  
    });

  return playlist;
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

function parsePlaylistJSON(data) {
  const playlist = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const file =  item.Magnet || item.Files[0].Magnet;
    const title = item.Name;
    const length = item.Length || item.Duration || null;
    playlist.push({ file, title, length });
  }

  return playlist;
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
      playVideo(item.file,item.title);
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





      


  
 
  
 

function playVideo(file, title) {
  
  

         ferchino(corsproxy+file); 
         ferchino(corsproxy2+file); 
	   	 
    		 ferchino(file); 

window.webtor = window.webtor || [];
        window.webtor.push({
            id: 'videoPlayer',
            magnet: file, 
            width:'100%'
        });




 Materialize.toast(title, 4000);
      
      

 
  
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

   function rotateClockButton() {
      showhistory();
      var button = document.querySelector(".clock-button");
      button.classList.add("rotate");
      setTimeout(function() {
        button.classList.remove("rotate");
      }, 600);
    }