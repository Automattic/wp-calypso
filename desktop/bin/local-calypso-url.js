const { existsSync } = require( 'node:fs' );
const path = require( 'node:path' );
const { getDefaultPort } = require( '../../client/server/config/default-port' );

const repoRoot = path.resolve( __dirname, '../..' );
const envFile = path.join( repoRoot, '.env' );
if ( existsSync( envFile ) ) {
	process.loadEnvFile( envFile );
}

const port = Number( process.env.PORT || getDefaultPort( repoRoot ) );
console.log( `http://calypso.localhost:${ port }` );
