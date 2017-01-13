/***** WARNING: node-compat code only here. Not transpiled! *****/

function middleware( app ) {
	const assets = require( './assets.json' );
	app.use( function( request, response, next ) {
		app.set( 'assets', assets );
		next();
	} );
}

module.exports = middleware;
