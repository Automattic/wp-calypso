/* eslint-disable no-console */

/**
 * External dependencies.
 */
var boot = require( 'boot' ),
	http = require( 'http' ),
	https = require( 'https' ),
	chalk = require( 'chalk' ),
	fs = require( 'fs' );

/**
 * Internal dependencies
 */
var pkg = require( './package.json' ),
	config = require( 'config' );

var start = Date.now(),
	protocol = process.env.PROTOCOL || config( 'protocol' ),
	port = process.env.PORT || config( 'port' ),
	host = process.env.HOST || config( 'hostname' ),
	app = boot(),
	server,
	compiler,
	hotReloader;

function sendBootStatus( status ) {
	// don't send anything if we're not running in a fork
	if ( ! process.send ) {
		return;
	}
	process.send( { boot: status } );
}

console.log(
	chalk.yellow( '%s booted in %dms - %s://%s:%s' ),
	pkg.name,
	( Date.now() ) - start,
	protocol,
	host,
	port
);

// Start a development HTTPS server.
if ( protocol === 'https' ) {
	const httpsOptions = {
		key: fs.readFileSync( './config/server/key.pem' ),
		cert: fs.readFileSync( './config/server/certificate.pem' )
	};
	server = https.createServer( httpsOptions, app );
} else {
	server = http.createServer( app );
}

// The desktop app runs Calypso in a fork.
// Let non-forks listen on any host.
if ( ! process.env.CALYPSO_IS_FORK ) {
	host = null;
}

server.listen( { port, host }, function() {
	// Tell the parent process that Calypso has booted.
	sendBootStatus( 'ready' );
} );

// Enable hot reloader in development
if ( process.env.NODE_ENV === 'development' ) {
	console.info( chalk.cyan( '\nGetting bundles ready, hold on...' ) );

	hotReloader = require( 'bundler/hot-reloader' );
	compiler = app.get( 'compiler' );

	compiler.plugin( 'compile', function() {
		sendBootStatus( 'compiler compiling' );
	} );
	compiler.plugin( 'invalid', function() {
		sendBootStatus( 'compiler invalid' );
	} );
	compiler.plugin( 'done', function() {
		sendBootStatus( 'compiler done' );
	} );

	hotReloader.listen( server, compiler );
}
