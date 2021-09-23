var loginFormVisible = false;
function login(){
	if(!loginFormVisible){	// switch tra le classi per l'animazione di ingresso e uscita
		document.getElementById("loginForm").classList.remove("animate__backOutRight");
		document.getElementById("loginForm").classList.add("animate__backInRight");
	}
	else{
		document.getElementById("loginForm").classList.remove("animate__backInRight");
		document.getElementById("loginForm").classList.add("animate__backOutRight");
	}
	loginFormVisible = !loginFormVisible;
}


var x;
function getPosition() {
	x = document.getElementById("cittaFiltro");
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(readPosition, showError);
	} else {
		alert("Geolocalizzazione non supportata dal browser");
	}
}

function readPosition(position) {
	console.log(x.childNodes[1]);
	x.childNodes[1].selected = "selected";
	x.childNodes[1].value = position.coords.latitude + "," + position.coords.longitude;
	x.childNodes[1].innerHTML = position.coords.latitude + " " + position.coords.longitude;
	//x.disabled = "disabled";
}

function showError(error) {
	switch(error.code) {
	case error.PERMISSION_DENIED:
		alert("Permesso negato");
		break;
	case error.POSITION_UNAVAILABLE:
		alert("Posizione non disponibile");
		break;
	case error.TIMEOUT:
		alert("Timeout richiesta");
		break;
	case error.UNKNOWN_ERROR:
		alert("Errore sconosciuto. Riprova più tardi");
		break;
	}
}




function _(id){
	return document.getElementById(id);
}


function filtra(){
	loadDoc(1);		// richiesta filtrata
	return false;
}

function loadDoc(cerca) {		// 0 -> ricerca normale | 1 -> ricerca filtrata | 2 -> ricerca per areaRiservata
	var xhttp = new XMLHttpRequest();	// creazione dell'oggetto
	xhttp.onreadystatechange = function() {		// quando cambia lo stato
		if (this.readyState == 4 && this.status == 200) {	// risposta pronta
			document.getElementById("dati").innerHTML = this.responseText;
		}
	};
	xhttp.open("POST", "/search", true);	// richiesta
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");	// header
	if(cerca == 1)
		xhttp.send("citta="+_("cittaFiltro").value+"&nome="+_("nomeFiltro").value+"&filtra=a");	// parametri
	else if(cerca == 0)
		xhttp.send();
	else if(cerca == 2)
		xhttp.send("reserved=1");
}





function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
   return result;
}

