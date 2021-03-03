var express = require("express");
var bodyParser = require("body-parser");
const path = require("path");
var app = express();
var React = require('react');


// set the template engine to ejs
app.set('view engine', 'ejs');

// Tells node to look in public/ for styles
app.use(express.static("public"));

// makes data that comes to the server from the client a json object
app.use(bodyParser.urlencoded({extended: true}));

// route to base domain
app.get("/", function(req, res){
    res.render("home.ejs");
});

// route to base domain
app.get("/home", function(req, res){
    res.render("home.ejs");
});

app.get("/ticktacktoe", function(req, res){
	file = path.join(__dirname, "public", "build", "index.html");
	console.log(file);
	res.sendFile(file);
})


// anything that hasn't matched a defined route is caught here
app.get("/*", function(req, res){
    res.render("error.ejs");
});

// listens for http requests
// port 3000 is for C9, port 8080 is for Heroku
app.listen(process.env.PORT || 8080, function(){
    console.log("Server is running");
});
