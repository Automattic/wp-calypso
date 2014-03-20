
/**
 * Module dependencies.
 */

var express = require('express');
var WPCONN = require('../');

/**
 * wpcon app data
 */

var wpapp = require('../test/data');

// Path to our public directory

var pub = __dirname + '/public';

// setup middleware

var app = express();
app.use(express.static(pub));

app.set('views', __dirname + '/views');

app.set('view engine', 'jade');

app.get('/', function(req, res){
  res.render('layout');
});

app.listen(3000);
console.log('Express app started on port 3000');
