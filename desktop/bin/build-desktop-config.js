const fs = require( 'fs' );
const path = require( 'path' );
const makeDir = require( 'make-dir' );

const DESKTOP_DIR = path.resolve( __dirname, '..' );
/*
 * Create a desktop/config.json file by merging source files according to `CONFIG_ENV` value
 */
const BASE_CONFIG = path.join( DESKTOP_DIR, 'desktop-config', 'config-base.json' );
const TARGET_CONFIG = path.join(
	DESKTOP_DIR,
	`desktop-config`,
	`config-${ process.env.CONFIG_ENV }.json`
);

const base = JSON.parse( fs.readFileSync( BASE_CONFIG, 'utf-8' ) );
let env;
try {
	env = JSON.parse( fs.readFileSync( TARGET_CONFIG, 'utf-8' ) );
} catch ( e ) {
	if ( process.env.CI ) {
		console.error( 'Error reading target config: ', e.message );
	}
}

if ( process.env.WINDOWS_STORE ) {
	// Disable auto and manual updates for the Windows Store
	env = Object.assign( env, { updater: false } );
}

const config = JSON.stringify( Object.assign( base, env ), null, 2 );

makeDir.sync( path.join( DESKTOP_DIR, 'config' ) );
fs.writeFileSync( path.join( DESKTOP_DIR, 'config', 'config.json' ), config, 'utf-8' );
