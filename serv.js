const express = require("express");
var session = require('express-session');

 
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
	console.log("a");
	dbo.collection("immobili").find({}).toArray(function(err, result) {
		if (err) throw err;
		res.render("index", {db: result});
	});
});


app.post("/", (req, res) => {
	//console.log(req.body);
	for(var property in req.body) {
		if(req.body[property] == '') req.body[property] = '*';
	}
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
	
	dbo.collection("immobili").find(query).toArray(function(err, result) {
		if (err){ console.log("Errore query: "+err);throw err; }
		res.render("index", {db: result});
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



app.get("/areaRiservata", (req, res) => {
	if(typeof req.session.email === 'undefined'){
		res.redirect('/'); 
		return; 
	} 
	res.render("areaRiservata", {redirect: false, nome: req.session.name, cognome: req.session.surname}); 
});

app.post("/areaRiservata", (req, res) => {
	var sess = req.session;
	console.log("Area riservata");
	console.log(sess);
	if(typeof req.session.email === 'undefined'){ res.redirect('/'); return; }
	
	var msg = "";
	if(typeof req.body.add !== 'undefined'){
		var obj = {titolo: req.body.nome, tipo: req.body.tipo, desc: req.body.desc, prezzo: req.body.prezzo, lon: req.body.lon, lat: req.body.lat};
		dbo.collection("immobili").insertOne(obj, function(err, res) {
			if (err) throw err;
			console.log("Immobile aggiunto");
			msg = "Immobile aggiunto";
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

