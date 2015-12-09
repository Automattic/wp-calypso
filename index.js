/**
 * External dependencies.
 */
var boot = require( 'boot' ),
	http = require( 'http' ),
	chalk = require( 'chalk' );

/**
 * Internal dependencies
 */
var pkg = require( './package.json' ),
	config = require( 'config' );

var start = Date.now(),
	port = process.env.PORT || 3000,
	host = config( 'hostname' ),
	app = boot(),
	server,
	hotReloader;

console.log( chalk.yellow('%s booted in %dms - http://%s:%s'), pkg.name, ( Date.now() ) - start, host, port );
console.info( chalk.cyan( '\nGetting bundles ready, hold on...' ) );
server = http.createServer( app );
server.listen( port );

// Enable hot reloader in development
if ( config( 'env' ) === 'development' ) {
	hotReloader = require( 'bundler/hot-reloader' );
	hotReloader.listen( server, app.get( 'compiler' ) );
}
