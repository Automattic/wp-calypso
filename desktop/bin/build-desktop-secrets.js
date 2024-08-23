#!/usr/bin/env node

const { execSync } = require( 'child_process' );
const path = require( 'path' );

const CALYPSO_SECRETS_ENCRYPTION_KEY = process.env.CALYPSO_SECRETS_ENCRYPTION_KEY;
if ( ! CALYPSO_SECRETS_ENCRYPTION_KEY ) {
	console.error( 'Failed to decrypt: CALYPSO_SECRETS_ENCRYPTION_KEY is not set.' );
	process.exit( 1 );
}

const PROJECT_DIR = path.resolve( __dirname, '../' );
const REPO_DIR = path.resolve( PROJECT_DIR, '../' );

const secrets = [
	path.resolve( PROJECT_DIR, 'resource', 'calypso', 'secrets.json' ),
	// path.resolve( PROJECT_DIR, 'resource', 'certificates', 'mac.p12' ),
	path.resolve( PROJECT_DIR, 'resource', 'certificates', 'win.p12' ),
];

for ( let i = 0; i < secrets.length; i++ ) {
	const encrypted = secrets[ i ] + '.enc';
	let decrypted;

	if ( path.basename( secrets[ i ] ) === 'secrets.json' ) {
		decrypted = path.join( REPO_DIR, 'config', 'secrets.json' );
	} else {
		decrypted = secrets[ i ];
	}

	let decryptFlags;
	if ( process.platform === 'win32' ) {
		decryptFlags = '-d';
	} else {
		decryptFlags = '-md md5 -d';
	}

	const cmd = `openssl aes-256-cbc ${ decryptFlags } -in ${ encrypted } -out ${ decrypted } -k "${ CALYPSO_SECRETS_ENCRYPTION_KEY }"`;

	try {
		execSync( cmd );
	} catch ( e ) {
		console.error( `Failed to decrypt ${ path.basename( encrypted ) }: `, e );
		process.exit( 1 );
	}
}

console.log( 'OK decrypted application secrets' );
