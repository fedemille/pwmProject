var loginFormVisible = false;
function login(){
	console.log("Eccomi");
	if(!loginFormVisible){
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
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(readPosition, showError);
	} else {
		alert("Geolocalizzazione non supportata.");
	}
}

function readPosition(position) {
	x = _("cittaFiltro");
	console.log(x.childNodes[1]);
	x.childNodes[1].selected = "selected";
	x.childNodes[1].value = position.coords.latitude + "," + position.coords.longitude;
	x.childNodes[1].innerHTML = "Posizione corrente";
	x.disabled = "disabled";
}

function _(id){
	return document.getElementById(id);
}
function filtra(){
	const xhttp = new XMLHttpRequest();
	xhttp.onload = function() {
		_("dati").innerHTML = this.responseText;
	}
	xhttp.open("POST", "/search");
	xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhttp.send("nome="+_("nomeFiltro").value+"&citta="+_("cittaFiltro").value);
	return false;
}

function showError(error) {
	switch(error.code) {
	case error.PERMISSION_DENIED:
		alert("User denied the request for Geolocation.");
		break;
	case error.POSITION_UNAVAILABLE:
		alert("Location information is unavailable.");
		break;
	case error.TIMEOUT:
		alert("The request to get user location timed out.");
		break;
	case error.UNKNOWN_ERROR:
		alert("An unknown error occurred.");
		break;
	}
} 




