var loginFormVisible = false;
function login(){
	//console.log("Eccomi");
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
	x = document.getElementById("cittaFiltro");
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(readPosition, showError);
	} else {
		alert("Geolocation is not supported by this browser.");
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



function filtra(){
	loadDoc(1);
	return false;
}


function _(id){
	return document.getElementById(id);
}

function loadDoc(cerca) {		// 0 -> ricerca normale | 1 -> ricerca filtrata | 2 -> ricerca per areaRiservata
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("dati").innerHTML = this.responseText;
		}
	};
	xhttp.open("POST", "/search", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	if(cerca == 1)
		xhttp.send("citta="+_("cittaFiltro").value+"&nome="+_("nomeFiltro").value+"&filtra=a");
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

