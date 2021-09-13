const express = require("express");
var session = require('express-session');

var formidable = require('formidable');
var fs = require('fs');

 
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://user1:provaUser1@cluster0.mfitf.mongodb.net/dbImmobiliare?retryWrites=true&w=majority"; 
var dbo;

const app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

//app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use( express.static( "public" ) );
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));


app.listen(80, () => {
  console.log(`Server is up and running on 5000 ...`);
});

app.use(function(req, res, next) {
	res.locals.nome = req.session.nome;
	next();
});
  



app.all("/", (req, res, next) => {
	console.log("Richiesta");
	next();
});

app.get("/", (req, res) => {
	console.log("heee");
	res.render("index");
});


app.post("/search", (req, res) => {
	console.log(req.body);
	/*for(var property in req.body) {
		if(req.body[property] == '') req.body[property] = '*';
	}*/
	
	if(typeof req.body.citta !== "undefined"){
		const aa = 0.1;
		var lat = parseFloat(req.body.citta.split(",")[0].trim());
		var lon = parseFloat(req.body.citta.split(",")[1].trim());
		var latl = lat-aa;
		var latg = lat+aa;
		var lonl = lon-aa;
		var longr = lon+aa;
		//console.log("Lat: " + req.body.citta.split(",")[1] + " " + longr);
		
		var query = { $or:[ {$and:[ {$and:[{lon:{$gte:lonl}}, {lon:{$lte:longr}}]}, {$and:[{lat:{$gte:latl}}, {lat:{$lte:latg}}]}]}, {titolo:req.body.nome}] };
		//var query = {$and:[ {$and:[{lon:{$gte:lonl}}, {lon:{$lte:longr}}]}, {$and:[{lat:{$gte:latl}}, {lat:{$lte:latg}}]}]};
	}
	else{
		var query = {};
	}
	
	dbo.collection("immobili").find(query).toArray(function(err, result) {
		if (err){ console.log("Errore query: "+err);throw err; }
		if (err){ console.log("Errore query: "+err);throw err; }
		if(typeof req.body.reserved !== "undefined")
			res.render("immobili", {dbReserved: result});
		else
			res.render("immobili", {db: result});
	});
	
});
//{ $or:[ {$and:[ {$and:[{lon:{$gte:"8"}}, {lon:{$lte:"10"}}]}, {$and:[{lat:{$gte:"44"}}, {lat:{$lte:"46"}}]}]}, {titolo:req.body.nome}] }
//{$and: [{$and: [{lat:{$gte:"45"}}  ]}  ]}


app.post("/login", (req, res) => {
	var query = { $and:[{email:req.body.email}, {password:req.body.password}] };
	
	dbo.collection("users").find(query).toArray(function(err, result) {
		if (err) throw err;
		if(result.length == 0)
			res.render("areaRiservata", {redirect: true, url: "/"});
			// return res.redirect('/admin');
		else{
			req.session.email = req.body.email;
			req.session.name = result[0].name;
			req.session.surname = result[0].surname;
			res.redirect('/areaRiservata');
			console.log("Accesso eseguito " + result[0].name);
		}
	});
});




var nodemailer = require('nodemailer');

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


function addslashes(string) {
    return string.replace(/\\/g, '\\\\').
        replace(/\u0008/g, '\\b').
        replace(/\t/g, '\\t').
        replace(/\n/g, '\\n').
        replace(/\f/g, '\\f').
        replace(/\r/g, '\\r').
        replace(/'/g, '\\\'').
        replace(/"/g, '\\"');
}


app.all("/valutaCasa", (req, res) => {
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


app.get("/immobile", (req, res) => {
	var ObjectId = require('mongodb').ObjectId;   
	//console.log(req.query);
	var o_id = new ObjectId(String(req.query.id));
	dbo.collection("immobili").find({_id: o_id}).toArray(function(err, result) {
		if (err){ console.log("Errore query: "+err);throw err; }
		console.log(result); 
		dbo.collection("images").find({idImmobile: result[0]._id}).toArray(function(err, resultImgs) {
			if (err){ console.log("Errore query: "+err);throw err; }
			res.render("immobile", {db: result, imgs: resultImgs});
		});
	});
}); 







const multer = require("multer");
const path = require("path");


const handleError = (err, res) => {
	res.status(500).contentType("text/plain").end("Oops! Something went wrong!");
};

const upload = multer({
	dest: "uploads"
	// you might also want to set some limits: https://github.com/expressjs/multer#limits
});





app.get("/image/:img", (req, res) => {
	console.log(req.params);
	res.sendFile(path.join(__dirname, "./uploads/"+req.params.img));
});





app.get("/areaRiservata", (req, res) => {
	if(typeof req.session.email === 'undefined'){
		res.redirect('/'); 
		return; 
	} 
	res.render("areaRiservata", {redirect: false, nome: req.session.name, cognome: req.session.surname}); 
});

app.post("/areaRiservata", upload.single("image"), (req, res) => {
	var sess = req.session;
	console.log("Area riservata");
	//console.log(sess);
	
	
	if(typeof req.session.email === 'undefined'){ res.redirect('/'); return; }
	
	var msg = "";
	if(typeof req.body.add !== 'undefined'){	// 500eef4eb97d50338558c8ae40939842 -->
		var nomeFile = "";
		if(typeof req.file !== 'undefined'){
			console.log("upload " + req.file.path);
			nomeFile = req.file.path;
			nomeFile = req.file.path.split("\\")[1]
		}
		
		const axios = require('axios');
		const params = {
			access_key: '500eef4eb97d50338558c8ae40939842',
			query: req.body.nomeCitta
		}

		axios.get('https://api.positionstack.com/v1/forward', {params})
		  .then(response => {
			console.log(response.data);
		  }).catch(error => {
			console.log(error);
		  });
		
		var longi = parseFloat(req.body.citta.split(",")[0].trim());
		var latit = parseFloat(req.body.citta.split(",")[1].trim());
		
		
		var obj = {titolo: req.body.nome, tipo: req.body.tipo, desc: req.body.desc, prezzo: req.body.prezzo, lon: longi, lat: latit, img: nomeFile};
		dbo.collection("immobili").insertOne(obj, function(err, res) {
			if (err) throw err;
			console.log("Immobile aggiunto");
			msg = "Immobile aggiunto";
		});
		res.render("areaRiservata", {redirect: false, msg: msg, nome: req.session.name, cognome: req.session.surname});
	}
	else if(typeof req.body.del !== 'undefined'){
		console.log("Da eliminare: -"+req.body.id.length+"-");
		var ObjectId = require('mongodb').ObjectId;
		var o_id = new ObjectId(String(req.body.id));
		
		dbo.collection("immobili").deleteOne({_id: o_id}, function(err, obj) {
			if (err) throw err;
			console.log(obj);
			console.log("Immobile eliminato");
			msg = "Immobile eliminato";
		});
		res.render("areaRiservata", {redirect: false, msg: msg, nome: req.session.name, cognome: req.session.surname});
	}
	else if(typeof req.body.logout !== 'undefined'){
		req.session.destroy((err) => {
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




MongoClient.connect(url, function(err, db) {
	if (err) throw err;
	console.log("Connected al DB");
	dbo = db.db("dbImmobiliare");
	
});

