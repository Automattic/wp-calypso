/* eslint-disable no-console */

require( '@babel/polyfill' );

/**
 * External dependencies.
 */
var boot = require( 'boot' ),
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
	const { execSync } = require( 'child_process' );
	const execOptions = { encoding: 'utf-8', windowsHide: true };
	let key = './config/server/key.pem';
	let certificate = './config/server/certificate.pem';

	if ( ! fs.existsSync( key ) || ! fs.existsSync( certificate ) ) {
		try {
			execSync( 'openssl version', execOptions );
			execSync( `openssl req -x509 -newkey rsa:2048 -keyout ./config/server/key.tmp.pem -out ${ certificate } -days 365 -nodes -subj "/C=US/ST=Foo/L=Bar/O=Baz/CN=calypso.localhost"`, execOptions );
			execSync( `openssl rsa -in ./config/server/key.tmp.pem -out ${ key }`, execOptions );
			execSync( 'rm ./config/server/key.tmp.pem', execOptions );
		} catch ( error ) {
			key = './config/server/key.default.pem';
			certificate = './config/server/certificate.default.pem';

			console.error( error );
		}
        }

        const options = {
                key: fs.readFileSync( key ),
                cert: fs.readFileSync( certificate )
	};
	server = require( 'https' ).createServer( options, app );
} else {
	server = require( 'http' ).createServer( app );
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
