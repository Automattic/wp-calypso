const fs = require( 'fs' );
const { ncp } = require( 'ncp' );

const BASE_CONFIG = 'desktop/desktop-config/config-base.json';
const TARGET_CONFIG = `desktop/desktop-config/config-${ process.env.CONFIG_ENV }.json`;

const base = JSON.parse( fs.readFileSync( BASE_CONFIG, 'utf-8' ) );
let env;
try {
	env = JSON.parse( fs.readFileSync( TARGET_CONFIG, 'utf-8' ) );
} catch {}

const config = JSON.stringify( Object.assign( base, env ), null, 2 );

fs.writeFileSync( 'client/desktop/config.json', config, 'utf-8' );

ncp(
	'config',
	'desktop/config',
	{ filter: ( name ) => /\/config(\/(secrets|_shared|desktop)\.json)?$/.test( name ) },
	( err ) => {
		if ( err ) {
			console.error( 'Failed to copy config files:', err );
		}
	}
);
