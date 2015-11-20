/***** WARNING: ES5 code only here. Not transpiled! *****/

var CALYPSO_ENV = process.env.CALYPSO_ENV || 'development';

function middleware( app ) {
	var assets = require( './assets-' + CALYPSO_ENV + '.json' );
	app.use( function( request, response, next ) {
		app.set( 'assets', assets );
		next();
	} );
}

module.exports = middleware;
