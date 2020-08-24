/**
 * Module dependencies.
 */

var express = require( 'express' );
var WPCOM = require( '../../' );

/**
 * wpcon app data
 */

var wpapp = require( '../../test/config' );

/**
 * Create a WPCOM instance
 */

var wpcom = WPCOM();

// setup middleware

var app = express();
var pub = __dirname + '/public';
app.use( express.static( pub ) );

app.set( 'views', __dirname + '/' );
app.set( 'view engine', 'jade' );

app.get( '/', function ( req, res ) {
	// set site id
	var site = wpcom.site( wpapp.site );

	// get site info
	site.get( function ( err, info ) {
		if ( err ) return console.log( err );

		// get lastest posts
		site.postsList( { number: 10 }, function ( err, posts ) {
			if ( err ) return console.log( err );

			res.render( 'layout', { site: info, posts: posts } );
		} );
	} );
} );

app.listen( 3000 );
console.log( 'wpcom app started on port 3000' );
