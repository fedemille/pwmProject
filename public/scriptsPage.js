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
	x.disabled = "disabled";
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




