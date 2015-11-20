/**
 * External dependecies
 */
var webpackMiddleware = require( 'webpack-dev-middleware' ),
	webpack = require( 'webpack' );

var utils = require( './utils' ),
	webpackConfig = require( 'webpack.config' );

function middleware( app ) {
	var compiler = webpack( webpackConfig ),
		callbacks = [],
		built = false,
		assets;

	app.set( 'compiler', compiler );

	compiler.plugin( 'done', function( stats ) {
		built = true;
		assets = utils.getAssets( stats.toJson() );
		app.set( 'assets', assets );

		// Dequeue and call request handlers
		while( callbacks.length > 0 ) {
			callbacks.shift()();
		}
	} );

	function waitForCompiler( request, next ) {
		if ( built ) {
			return next();
		}

		console.log( "Waiting for webpack to finish compiling..." );

		// Queue request handlers until the initial build is complete
		callbacks.push( waitForCompiler.bind( null, request, next ) );
	}

	app.use( function( request, response, next ) {
		waitForCompiler( request, next );
	} );

	app.use( webpackMiddleware( compiler, {
		publicPath: '/calypso/',
		stats: {
			colors: true,
			hash: true,
			version: false,
			timings: true,
			assets: true,
			chunks: true,
			chunkModules: false,
			modules: false,
			cached: false,
			reasons: false,
			source: false,
			errorDetails: true
		}
	} ) );
}

module.exports = middleware;
