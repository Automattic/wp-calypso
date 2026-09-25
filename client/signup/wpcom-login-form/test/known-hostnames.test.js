/**
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';
import { CALYPSO_ONLY_HOSTNAMES } from '..';

const clientDir = path.resolve( __dirname, '..', '..', '..' );
const configDir = path.resolve( clientDir, '..', 'config' );

// Sections that can render WpcomLoginForm. Configs that enable none of them
// never reach `getFormAction`, so their hostnames don't belong in the list —
// that, and not their own login flows, is why jetpack-cloud and
// a8c-for-agencies are absent. Pinned by the `call sites` test below.
const LOGIN_FORM_SECTIONS = [ 'accept-invite', 'jetpack-connect', 'login', 'signup', 'stepper' ];

const LOGIN_FORM_CALL_SITES = {
	'jetpack-connect/signup.jsx': 'jetpack-connect',
	'landing/stepper/declarative-flow/internals/steps-repository/__user/index.tsx': 'stepper',
	'login/desktop-login/finalize.tsx': 'login',
	'my-sites/invites/invite-accept-logged-out/index.jsx': 'accept-invite',
	'signup/main.jsx': 'signup',
};

// The one deployed hostname that does serve wp-login.php, and so must keep
// using the wp-login.php of the site named in `redirectTo`.
const SERVES_WP_LOGIN = [ 'wordpress.com' ];

const NON_APP_CONFIGS = [ 'client.json', 'secrets.json', 'empty-secrets.json' ];

function readConfig( file ) {
	return JSON.parse( fs.readFileSync( path.join( configDir, file ), 'utf8' ) );
}

function rendersLoginForm( config, enableAllByDefault ) {
	const { sections } = config;
	const enableAllSections = config.enable_all_sections ?? enableAllByDefault;

	if ( ! sections ) {
		return enableAllSections;
	}

	return LOGIN_FORM_SECTIONS.some( ( section ) =>
		sections[ section ] === undefined ? enableAllSections : sections[ section ]
	);
}

function getConfiguredHostnames() {
	const enableAllByDefault = readConfig( '_shared.json' ).enable_all_sections;
	const hostnames = new Set();

	const configFiles = fs
		.readdirSync( configDir )
		.filter(
			( file ) =>
				file.endsWith( '.json' ) && ! file.startsWith( '_' ) && ! NON_APP_CONFIGS.includes( file )
		);

	for ( const file of configFiles ) {
		const config = readConfig( file );

		// `config( 'hostname' )` is only ever one of these in a deployed
		// environment, and only an app that renders the form reaches
		// `getFormAction` at all.
		if ( config.env !== 'production' || ! rendersLoginForm( config, enableAllByDefault ) ) {
			continue;
		}

		for ( const hostname of [ config.hostname, ...( config.hostname_allowlist ?? [] ) ] ) {
			if ( hostname && ! SERVES_WP_LOGIN.includes( hostname ) ) {
				hostnames.add( hostname );
			}
		}
	}

	return hostnames;
}

function findLoginFormCallSites() {
	const callSites = [];

	( function walk( dir ) {
		for ( const entry of fs.readdirSync( dir, { withFileTypes: true } ) ) {
			const filePath = path.join( dir, entry.name );

			if ( entry.isDirectory() ) {
				if ( ! [ 'node_modules', 'test' ].includes( entry.name ) ) {
					walk( filePath );
				}
			} else if (
				/\.[jt]sx?$/.test( entry.name ) &&
				fs.readFileSync( filePath, 'utf8' ).includes( 'wpcom-login-form' )
			) {
				callSites.push( path.relative( clientDir, filePath ) );
			}
		}
	} )( clientDir );

	return callSites.sort();
}

describe( 'CALYPSO_ONLY_HOSTNAMES', () => {
	test( 'covers every deployed hostname that does not serve wp-login.php', () => {
		const missing = [ ...getConfiguredHostnames() ]
			.filter( ( hostname ) => ! CALYPSO_ONLY_HOSTNAMES.includes( hostname ) )
			.sort();

		expect( missing ).toEqual( [] );
	} );

	test( 'lists nothing that is not such a hostname', () => {
		const configured = getConfiguredHostnames();
		const stale = CALYPSO_ONLY_HOSTNAMES.filter( ( hostname ) => ! configured.has( hostname ) );

		expect( stale ).toEqual( [] );
	} );

	test( 'call sites all belong to a section in LOGIN_FORM_SECTIONS', () => {
		expect( findLoginFormCallSites() ).toEqual( Object.keys( LOGIN_FORM_CALL_SITES ).sort() );
		expect( [ ...new Set( Object.values( LOGIN_FORM_CALL_SITES ) ) ].sort() ).toEqual(
			LOGIN_FORM_SECTIONS
		);
	} );
} );
