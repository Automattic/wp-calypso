const { spawn } = require( 'child_process' );
const net = require( 'net' );

function isPortFree( port ) {
	return new Promise( ( resolve ) => {
		const server = net.createServer();
		server.once( 'error', () => resolve( false ) );
		server.once( 'listening', () => server.close( () => resolve( true ) ) );
		// No host = all interfaces, matching how the dev server binds.
		server.listen( port );
	} );
}

async function findFreePort( base, tries = 50 ) {
	for ( let port = base; port < base + tries; port++ ) {
		// eslint-disable-next-line no-await-in-loop
		if ( await isPortFree( port ) ) {
			return port;
		}
	}
	throw new Error( `No free port found between ${ base } and ${ base + tries }` );
}

async function main() {
	const command = process.argv.slice( 2 );
	if ( ! command.length ) {
		console.error( 'Usage: node bin/with-free-port.js <command…>' );
		process.exit( 1 );
	}

	const base = parseInt( process.env.PORT, 10 ) || 3000;
	const port = await findFreePort( base );

	if ( port !== base ) {
		console.log( `\n⚠  Port ${ base } is in use — starting on ${ port }` );
	}
	console.log( `→ http://calypso.localhost:${ port }\n` );

	const child = spawn( command.join( ' ' ), {
		shell: true,
		stdio: 'inherit',
		env: { ...process.env, PORT: String( port ) },
	} );

	const forward = ( signal ) => child.kill( signal );
	process.on( 'SIGINT', forward );
	process.on( 'SIGTERM', forward );

	child.on( 'exit', ( code, signal ) => {
		if ( signal ) {
			process.kill( process.pid, signal );
		} else {
			process.exit( code ?? 0 );
		}
	} );
}

main().catch( ( error ) => {
	console.error( error.message );
	process.exit( 1 );
} );
