/***** WARNING: ES5 code only here. Not transpiled! *****/

function middleware( app ) {
	var assets = require( './assets.json' );
	app.use( function( request, response, next ) {
		app.set( 'assets', assets );
		next();
	} );
}

module.exports = middleware;
