var express = require("express");
var bodyParser = require("body-parser");
var app = express();

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


// handle the login page
app.get("/login", function(req, res){
    
    // this is an example of how you can send data down to the client with the ejs files
    res.render("login.ejs");
});


// anything that hasn't matched a defined route is caught here
app.get("/*", function(req, res){
    res.render("error.ejs");
});

// listens for http requests
// port 3000 is for C9, port 8080 is for Heroku
app.listen(process.env.PORT || 3000 || 8080, function(){
    console.log("Server is running");
});
