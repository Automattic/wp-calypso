/**
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';
import { CALYPSO_ONLY_HOSTNAMES } from '..';

const configDir = path.resolve( __dirname, '..', '..', '..', '..', 'config' );

// Configs for apps that are not Calypso or the Dashboard. They serve their own
// login flows, so their hostnames are deliberately absent from the list.
const OTHER_APP_CONFIGS = /^(jetpack-cloud|a8c-for-agencies)-/;

// wordpress.com is the default origin, and unlike the Calypso-only deployments
// it does serve wp-login.php.
const EXCLUDED_HOSTNAMES = [ 'wordpress.com' ];

function getConfiguredHostnames() {
	const hostnames = new Set();

	const configFiles = fs
		.readdirSync( configDir )
		.filter(
			( file ) =>
				file.endsWith( '.json' ) &&
				! file.startsWith( '_' ) &&
				! OTHER_APP_CONFIGS.test( file ) &&
				! [ 'client.json', 'secrets.json', 'empty-secrets.json' ].includes( file )
		);

	for ( const file of configFiles ) {
		const config = JSON.parse( fs.readFileSync( path.join( configDir, file ), 'utf8' ) );

		for ( const hostname of [ config.hostname, ...( config.hostname_allowlist ?? [] ) ] ) {
			if ( hostname && ! EXCLUDED_HOSTNAMES.includes( hostname ) ) {
				hostnames.add( hostname );
			}
		}
	}

	return hostnames;
}

describe( 'CALYPSO_ONLY_HOSTNAMES', () => {
	test( 'covers every hostname configured for Calypso and the Dashboard', () => {
		const missing = [ ...getConfiguredHostnames() ]
			.filter( ( hostname ) => ! CALYPSO_ONLY_HOSTNAMES.includes( hostname ) )
			.sort();

		expect( missing ).toEqual( [] );
	} );

	test( 'does not list hostnames that are no longer configured', () => {
		const configured = getConfiguredHostnames();
		const stale = CALYPSO_ONLY_HOSTNAMES.filter( ( hostname ) => ! configured.has( hostname ) );

		expect( stale ).toEqual( [] );
	} );
} );
