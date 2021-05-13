/**
 * Module dependencies.
 */

const express = require( 'express' );
const path = require( 'path' );
const WPCOM = require( '../../' );

/**
 * wpcon app data
 */

const wpapp = require( '../../test/config' );

/**
 * Create a WPCOM instance
 */

const wpcom = WPCOM();

// setup middleware

const app = express();
const pub = path.join( __dirname, '/public' );
app.use( express.static( pub ) );

app.set( 'views', path.join( __dirname, '/' ) );
app.set( 'view engine', 'jade' );

app.get( '/', function ( req, res ) {
	// set site id
	const site = wpcom.site( wpapp.site );

	// get site info
	site.get( function ( err, info ) {
		if ( err ) return console.log( err );

		// get lastest posts
		site.postsList( { number: 10 }, function ( error, posts ) {
			if ( error ) return console.log( error );

			res.render( 'layout', { site: info, posts: posts } );
		} );
	} );
} );

app.listen( 3000 );
console.log( 'wpcom app started on port 3000' );
