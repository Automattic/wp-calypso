/**
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';

const configDir = path.resolve( __dirname, '..', '..', '..', '..', 'config' );

function readConfig( filename ) {
	return JSON.parse( fs.readFileSync( path.join( configDir, filename ), 'utf8' ) );
}

const sharedConfig = readConfig( '_shared.json' );
const allCalypsoHostnames = sharedConfig.all_calypso_hostnames;

// Hostnames that are intentionally excluded from all_calypso_hostnames
// (e.g. wordpress.com is the default everywhere, jetpack/a8c apps have separate login flows).
const EXCLUDED_HOSTNAMES = [
	'wordpress.com',
	// jetpack-cloud hostnames
	'jetpack.cloud.localhost',
	'cloud.jetpack.com',
	// a8c-for-agencies hostnames
	'agencies.localhost',
	'agencies.automattic.com',
];

describe( 'all_calypso_hostnames in _shared.json', () => {
	const configFiles = fs
		.readdirSync( configDir )
		.filter(
			( f ) =>
				f.endsWith( '.json' ) &&
				f !== '_shared.json' &&
				f !== 'client.json' &&
				f !== 'secrets.json' &&
				f !== 'empty-secrets.json'
		);

	test( 'every Calypso/Dashboard config hostname is present', () => {
		const expectedHostnames = new Set();

		for ( const file of configFiles ) {
			const config = readConfig( file );

			if ( config.hostname && ! EXCLUDED_HOSTNAMES.includes( config.hostname ) ) {
				expectedHostnames.add( config.hostname );
			}

			if ( Array.isArray( config.hostname_allowlist ) ) {
				for ( const h of config.hostname_allowlist ) {
					if ( ! EXCLUDED_HOSTNAMES.includes( h ) ) {
						expectedHostnames.add( h );
					}
				}
			}
		}

		expect( [ ...allCalypsoHostnames ].sort() ).toEqual( [ ...expectedHostnames ].sort() );
	} );
} );
