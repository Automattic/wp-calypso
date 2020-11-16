/* eslint-disable no-console */
/* eslint-disable import/no-nodejs-modules */

import 'source-map-support/register';
import '@automattic/calypso-polyfills';

/**
 * External dependencies.
 */
import fs from 'fs';

/**
 * Internal dependencies
 */
import boot from './boot';
import config from './config';
import { getLogger } from './lib/logger';

const logger = getLogger();
const start = Date.now();
const protocol = process.env.PROTOCOL || config( 'protocol' );
const port = process.env.PORT || config( 'port' );
const host = process.env.HOST || config( 'hostname' );
const app = boot();

function sendBootStatus( status ) {
	// don't send anything if we're not running in a fork
	if ( ! process.send ) {
		return;
	}
	process.send( { boot: status } );
}

logger.info( 'wp-calypso booted in %dms - %s://%s:%s', Date.now() - start, protocol, host, port );

function loadSslCert() {
	const { execSync } = require( 'child_process' );
	const execOptions = { encoding: 'utf-8', windowsHide: true };
	let key = './config/server/key.pem';
	let certificate = './config/server/certificate.pem';

	if ( ! fs.existsSync( key ) || ! fs.existsSync( certificate ) ) {
		try {
			execSync( 'openssl version', execOptions );
			execSync(
				`openssl req -x509 -newkey rsa:2048 -keyout ./config/server/key.tmp.pem -out ${ certificate } -days 365 -nodes -subj "/C=US/ST=Foo/L=Bar/O=Baz/CN=calypso.localhost"`,
				execOptions
			);
			execSync( `openssl rsa -in ./config/server/key.tmp.pem -out ${ key }`, execOptions );
			execSync( 'rm ./config/server/key.tmp.pem', execOptions );
		} catch ( error ) {
			key = './config/server/key.default.pem';
			certificate = './config/server/certificate.default.pem';

			console.error( error );
		}
	}

	return {
		key: fs.readFileSync( key ),
		cert: fs.readFileSync( certificate ),
	};
}

// Start a development HTTPS server.
function createServer() {
	if ( protocol === 'https' ) {
		return require( 'https' ).createServer( loadSslCert(), app );
	}

	setTimeout( getServerRoot, 1500 );
	return require( 'http' ).createServer( app );
}

// Sends a "GET /" to the dev server in order to kickstart the compilation process.
function getServerRoot() {
	const thisHost = process.env.HOST || config( 'hostname' );
	const thisPort = process.env.PORT || config( 'port' );

	const http = require( 'http' );
	const options = {
		hostname: thisHost,
		port: thisPort,
		path: '/',
		method: 'GET',
	};

	const req = http.request( options, ( res ) => {
		console.log( `statusCode: ${ res.statusCode }` );

		res.on( 'data', ( d ) => {
			process.stdout.write( d );
		} );
	} );

	req.on( 'error', ( error ) => {
		console.error( error );
	} );

	req.end();
}

const server = createServer();
if ( process.env.NODE_ENV !== 'development' ) {
	server.timeout = 50 * 1000; //50 seconds, in ms;
}

process.on( 'uncaughtExceptionMonitor', ( err ) => {
	logger.error( err );
} );

// The desktop app runs Calypso in a fork. Let non-forks listen on any host.
server.listen( { port, host: process.env.CALYPSO_IS_FORK ? host : null }, function () {
	// Tell the parent process that Calypso has booted.
	sendBootStatus( 'ready' );
} );
