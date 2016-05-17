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
	config = require( 'config' ),
	desktop = require( 'desktop/process' );

var start = Date.now(),
	port = process.env.PORT || 3000,
	host = process.env.HOST || config( 'hostname' ),
	app = boot(),
	server,
	hotReloader;

console.log( chalk.yellow( '%s booted in %dms - http://%s:%s' ), pkg.name, ( Date.now() ) - start, host, port );
console.info( chalk.cyan( '\nGetting bundles ready, hold on...' ) );

server = http.createServer( app );

// The desktop app runs Calypso in a fork.
if ( desktop.isForkedProcess() ) {
	// We need to run it with an explicit hostname to avoid firewall warnings.
	server.listen( { port, host }, function() {
		// Tell the parent process that Calypso has booted.
		desktop.ready();
	} );
} else {
	// Let non-forks listen on any host.
	server.listen( port );
}

// Enable hot reloader in development
if ( config( 'env' ) === 'development' ) {
	hotReloader = require( 'bundler/hot-reloader' );
	hotReloader.listen( server, app.get( 'compiler' ) );
}
