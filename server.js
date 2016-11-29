/**
 * Lightweight static file server
 */
var express = require('express');
var app = express();
var compression = require('compression');
var favicon = require('serve-favicon');

// Enable gzip
app.use(compression());

// Favicon
app.use(favicon(__dirname + '/public/assets/images/favicon.ico'));

/**
 * GET static files
 */

// Generated HTML/CSS/JS files
app.use(express.static(__dirname + '/public/dist'));

// Assets + Images
app.use(express.static(__dirname + '/public/assets', { maxAge: '2 days' }));

// If request is not in above static folders, throw 404
app.get("*", function(req, res, next) {
  res.status(404).send("<h1>The requested page is nowhere to be found. 🤔</h1><h2>Try <a href='//sethwieder.com'>sethwieder.com</a> 👍</h2>");
});

// Run server
app.listen(process.env.PORT || 3000, function(){
  console.log("Server listening on port", this.address().port, "👌");
});
