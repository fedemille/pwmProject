const express = require("express");			// gestione delle richieste http
var session = require('express-session');	// gestione delle sessioni

var formidable = require('formidable');
var fs = require('fs');						// gestione filesystem

const multer = require("multer");			// per upload file
const path = require("path");			// per upload file

 
var MongoClient = require('mongodb').MongoClient;	// per la connessione al DB
var url = "mongodb+srv://user1:provaUser1@cluster0.mfitf.mongodb.net/dbImmobiliare?retryWrites=true&w=majority"; 
var dbo;

const app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));


app.set("view engine", "ejs");
app.use( express.static( "public" ) );
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));


app.listen(80, () => {
  console.log("Web server inizializzato e in ascolto");
});

app.use(function(req, res, next) {
	res.locals.nome = req.session.nome;
	next();
});
  



app.all("/", (req, res, next) => {		// richiesta generica alla homepage
	console.log("Richiesta");
	next();
});

app.get("/", (req, res) => {			// richiesta get alla homepage
	res.render("index", {nome: req.session.name});	// passaggio del nome loggato
});


app.post("/search", (req, res) => {		// richiesta di ricerca degli immobili (tramite AJAX)
	
	if(typeof req.body.filtra !== "undefined"){		// filtraggio degli immobili
		console.log("Filtro");
		var latl=0, latg=100, lonl=0, longr=100;	// coordinate di default
		
		if(req.body.nome == "") req.body.nome = /./;		// nome qualsiasi
		else req.body.nome = {'$regex' : req.body.nome, '$options' : 'i'};
		
		if(req.body.citta != ""){	// se definita una posizione specifica
			const aa = 0.1;		// precisione del luogo
			var lat = parseFloat(req.body.citta.split(",")[0].trim());	// conversione
			var lon = parseFloat(req.body.citta.split(",")[1].trim());
			var latl = lat-aa;	// calcolo del range
			var latg = lat+aa;
			var lonl = lon-aa;
			var longr = lon+aa;
		}
		
		var query = { 
					$and:
						[ 
							{
							$and:
								[ 
									{
									$and:
										[
											{lon:{$gte:lonl}}, 
											{lon:{$lte:longr}}
										]
									}, 
									{
									$and:
										[
											{lat:{$gte:latl}}, 
											{lat:{$lte:latg}}
										]
									}
								]
							}, 
							{titolo:req.body.nome}
						] 
					};
	}
	else{
		var query = {};
	}
	
	dbo.collection("immobili").find(query).toArray(function(err, result) {		// ricerca
		if (err){ console.log("Errore query: "+err);throw err; }
		if(typeof req.body.reserved !== "undefined")	// se richiesto dall'area riservata
			res.render("immobili", {dbReserved: result});
		else
			res.render("immobili", {db: result});
	});
	
});



app.post("/login", (req, res) => {			// richiesta di autenticazione
	var query = { $and:[{email:req.body.email}, {password:req.body.password}] };
	
	dbo.collection("users").find(query).toArray(function(err, result) {
		if (err) throw err;
		if(result.length == 0)		// nessun risultato trovato nel database
			res.render("areaRiservata", {redirect: true, url: "/"});
		else{
			req.session.email = req.body.email;		// salvataggio della sessione
			req.session.name = result[0].name;
			req.session.surname = result[0].surname;
			res.redirect('/areaRiservata');
			console.log("Accesso eseguito " + result[0].name);
		}
	});
});




var nodemailer = require('nodemailer');		// gestione per l'invio delle mail

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'agenzia@gmail.com',
		pass: 'psw'
	}
});
var mailOptions = {
	from: 'agenzia@gmail.com',
	to: 'agenzia@gmail.com',
	subject: 'Valutazione immobile',
	text: ''
};


function addslashes(string) {		// funzione per la "pulizia" del testo preso in input per evitare alcuni attacchi di injection
    return string.replace(/\\/g, '\\\\').
        replace(/\u0008/g, '\\b').
        replace(/\t/g, '\\t').
        replace(/\n/g, '\\n').
        replace(/\f/g, '\\f').
        replace(/\r/g, '\\r').
        replace(/'/g, '\\\'').
        replace(/"/g, '\\"');
}


app.all("/valutaCasa", (req, res) => {		// richiesta della pagina di valutazione casa
	if(typeof req.body.richiesta !== "undefined"){
		mailOptions.text = 'Richiesta valutazione di un ' + addslashes(req.body.tipo) + ' da ' + addslashes(req.body.email) + '. ' + addslashes(req.body.richiesta);
		
		transporter.sendMail(mailOptions, function(error, info){
			if (error) {
				console.log(error);
			}
			else {
				console.log('Email sent: ' + info.response);
			}
		}); 
		res.render("valutaCasa", {okay: {}}); 
	}
	else
		res.render("valutaCasa");
	
});


app.get("/immobile", (req, res) => {			// richiesta della pagina di visualizzazione del singolo immobile
	var ObjectId = require('mongodb').ObjectId;
	var o_id = new ObjectId(String(req.query.id));
	dbo.collection("immobili").find({_id: o_id}).toArray(function(err, result) {
		if (err){ console.log("Errore query: "+err);throw err; }
		console.log(result); 
		dbo.collection("images").find({idImmobile: result[0]._id}).toArray(function(err, resultImgs) {
			if (err){ console.log("Errore query: "+err);throw err; }
			
			
			if(typeof req.body.casa !== "undefined"){
				mailOptions.text = 'Richiesta di acquisto ' + addslashes(req.body.nameImm) + ' (' + addslashes(req.body.idImm) + '). Telefono: ' + addslashes(req.body.tel);
				
				transporter.sendMail(mailOptions, function(error, info){
					if (error)
						console.log(error);
					else
						console.log('Email sent: ' + info.response);
				}); 
				res.render("immobile", {db: result, imgs: resultImgs, okay: {}});
			}
			else
				res.render("immobile", {db: result, imgs: resultImgs});
			
			
			
		});
	});
}); 









const upload = multer({
	dest: "uploads"
});





app.get("/image/:img", (req, res) => {			// richiesta di visualizzazione di un'immagine (img)
	console.log(req.params);
	res.sendFile(path.join(__dirname, "./uploads/"+req.params.img));
});





app.get("/areaRiservata", (req, res) => {		// richiesta della pagina dell'area riservata | get -> richiesta base
	if(typeof req.session.email === 'undefined'){
		res.redirect('/'); 
		return; 
	} 
	res.render("areaRiservata", {redirect: false, nome: req.session.name, cognome: req.session.surname}); 
});

app.post("/areaRiservata", upload.single("image"), (req, res) => {		// richiesta della pagina dell'area riservata | post -> richiesta di un servizio
	var sess = req.session;
	console.log("Area riservata");
	
	
	if(typeof req.session.email === 'undefined'){ res.redirect('/'); return; }		// check sessione attiva
	
	var msg = "";
	if(typeof req.body.add !== 'undefined'){		// aggiunta di un immobile
		var nomeFile = "";
		if(typeof req.file !== 'undefined'){	// se uploaddata un'immagine dell'immobile
			console.log("upload " + req.file.path);
			nomeFile = req.file.path;
			nomeFile = req.file.path.split("\\")[1];	// prende solo il nome del file
		}
		
		
		var longi = parseFloat(req.body.citta.split(",")[0].trim());	// coordinate
		var latit = parseFloat(req.body.citta.split(",")[1].trim());
		
		
		var obj = {titolo: req.body.nome, tipo: req.body.tipo, desc: req.body.desc, prezzo: req.body.prezzo, lon: longi, lat: latit, img: nomeFile};
		dbo.collection("immobili").insertOne(obj, function(err, res) {	// inserimento nel database
			if (err) throw err;
			console.log("Immobile aggiunto");
			msg = "Immobile aggiunto";
		});
		res.render("areaRiservata", {redirect: false, msg: msg, nome: req.session.name, cognome: req.session.surname});
	}
	else if(typeof req.body.del !== 'undefined'){		// eliminazione di un immobile
		console.log("Da eliminare: -"+req.body.id.length+"-");
		var ObjectId = require('mongodb').ObjectId;
		var o_id = new ObjectId(String(req.body.id));	// conversione della stringa in ObjectId
		
		dbo.collection("immobili").deleteOne({_id: o_id}, function(err, obj) {
			if (err) throw err;
			console.log(obj);
			console.log("Immobile eliminato");
			msg = "Immobile eliminato";
		});
		res.render("areaRiservata", {redirect: false, msg: msg, nome: req.session.name, cognome: req.session.surname});
	}
	else if(typeof req.body.logout !== 'undefined'){	// LOGOUT
		req.session.destroy((err) => {		// distrugge la sessione
			if(err) {
				console.log(err);
			}
			console.log("Cancellazione sessione");
			res.redirect('/');
		});
	}
	else
		res.render("areaRiservata", {redirect: false, msg: msg, nome: req.session.name, cognome: req.session.surname});
	
});




MongoClient.connect(url, function(err, db) {	// connessione al database
	if (err) throw err;
	console.log("Connesso al DB");
	dbo = db.db("dbImmobiliare");
	
});

