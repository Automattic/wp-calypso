import fs from 'fs';
import 'source-map-support/register';
import '@automattic/calypso-polyfills';
import boot from './boot';
import { getLogger } from './lib/logger';

/*const logger = getLogger();
const start = Date.now();
const protocol = 'http';
const port = 3000;
const host = 'calypso.localhost';
const app = boot();

debugger;

process.on( 'unhandledRejection', ( reason, promise ) => {
	console.error( 'Unhandled Rejection at:', promise, 'reason:', reason );
	// Application specific logging, throwing an error, or other logic here
} );

function sendBootStatus( status ) {
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

process.on( 'uncaughtExceptionMonitor', ( err ) => {
	logger.error( err );
} );

// Bun.serve() integration
Bun.serve( {
	fetch( req ) {
		// Your existing app logic to handle requests
		// Ensure compatibility with Bun's fetch API
		return app.handle( req );
	},
	port: port,
	hostname: process.env.CALYPSO_IS_FORK ? host : null,
	// SSL certification loading, if HTTPS is required
	...( protocol === 'https' ? { cert: loadSslCert().cert, key: loadSslCert().key } : {} ),
} ).then( () => {
	sendBootStatus( 'ready' );
} );*/
