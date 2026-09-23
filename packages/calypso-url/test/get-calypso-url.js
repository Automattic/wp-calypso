/**
 * @jest-environment jsdom
 */

import fs from 'fs';
import path from 'path';
import { getCalypsoUrl } from '../src';

const configDir = path.resolve( __dirname, '..', '..', '..', 'config' );

const NON_APP_CONFIGS = [ 'client.json', 'secrets.json', 'empty-secrets.json' ];

// At least for now, getCalypsoUrl() should not return URLs for these apps.
const OTHER_APP_CONFIGS = /^(dashboard|jetpack-cloud|a8c-for-agencies)-/;
const DASHBOARD_CONFIGS = /^dashboard-/;

function readConfig( file ) {
	return JSON.parse( fs.readFileSync( path.join( configDir, file ), 'utf8' ) );
}

function getAppConfigFiles() {
	return fs
		.readdirSync( configDir )
		.filter(
			( file ) =>
				file.endsWith( '.json' ) && ! file.startsWith( '_' ) && ! NON_APP_CONFIGS.includes( file )
		);
}

function getHostnames( files ) {
	const hostnames = new Set();

	for ( const file of files ) {
		const config = readConfig( file );

		for ( const hostname of [ config.hostname, ...( config.hostname_allowlist ?? [] ) ] ) {
			if ( hostname ) {
				hostnames.add( hostname );
			}
		}
	}

	return hostnames;
}

// This package can't read the Calypso config because it is used from outside
// Calypso, so the allowed origins are hardcoded. These tests ensure the
// hardcoded origins don't get out of sync with the config.
//
// Whether MSD hostnames should count as "Calypso" for `calypso_origin` is still
// an open question, so Dashboard hostnames are subtracted rather than filtered
// out by filename: `development.json` allowlists them too, because the Calypso
// dev server also serves the Dashboard.
function getCalypsoConfigHostnames() {
	const files = getAppConfigFiles();
	const dashboardHostnames = getHostnames(
		files.filter( ( file ) => DASHBOARD_CONFIGS.test( file ) )
	);

	return [ ...getHostnames( files.filter( ( file ) => ! OTHER_APP_CONFIGS.test( file ) ) ) ].filter(
		( hostname ) => ! dashboardHostnames.has( hostname )
	);
}

let backupWindow;

function mockCaplysoOriginQueryArg( origin ) {
	// mock the window.location.search string
	window.location.search = `?calypso_origin=${ origin }`;
}

describe( 'getCalypsoUrl', () => {
	beforeAll( () => {
		backupWindow = window;
		Object.defineProperty( window, 'location', {
			value: { search: '' },
			writable: true,
		} );
	} );
	afterAll( () => {
		window = backupWindow;
	} );

	test( 'it returns `https://wordpress.com` with no query args', () => {
		expect( getCalypsoUrl() ).toBe( 'https://wordpress.com' );
	} );

	test( 'it returns `https://wordpress.com` with the wrong query args', () => {
		mockCaplysoOriginQueryArg( 'https://foo.bar' );
		expect( getCalypsoUrl() ).toBe( 'https://wordpress.com' );

		mockCaplysoOriginQueryArg( 'https://foo-wordpress.com' );
		expect( getCalypsoUrl() ).toBe( 'https://wordpress.com' );

		mockCaplysoOriginQueryArg( 'https://xsswordpress.com' );
		expect( getCalypsoUrl() ).toBe( 'https://wordpress.com' );
	} );

	test( 'it returns calypso.live URL with the right query args', () => {
		mockCaplysoOriginQueryArg( 'https://container-frisky-fox.calypso.live' );
		expect( getCalypsoUrl() ).toBe( 'https://container-frisky-fox.calypso.live' );
	} );

	test( 'it returns wpcalypso URL with the right query args', () => {
		mockCaplysoOriginQueryArg( 'https://wpcalypso.wordpress.com' );
		expect( getCalypsoUrl() ).toBe( 'https://wpcalypso.wordpress.com' );
	} );

	test( 'it returns horizon URL with the right query args', () => {
		mockCaplysoOriginQueryArg( 'https://horizon.wordpress.com' );
		expect( getCalypsoUrl() ).toBe( 'https://horizon.wordpress.com' );
	} );

	test( 'it returns calypso.localhost URL with the right query args', () => {
		mockCaplysoOriginQueryArg( 'http://calypso.localhost:3000' );
		expect( getCalypsoUrl() ).toBe( 'http://calypso.localhost:3000' );
	} );

	test( 'it returns https calypso.localhost URL with the right query args', () => {
		mockCaplysoOriginQueryArg( 'https://calypso.localhost:3000' );
		expect( getCalypsoUrl() ).toBe( 'https://calypso.localhost:3000' );
	} );

	test.each( getCalypsoConfigHostnames() )(
		'it accepts %s, the hostname of a configured Calypso environment',
		( hostname ) => {
			mockCaplysoOriginQueryArg( `https://${ hostname }` );
			expect( getCalypsoUrl() ).toBe( `https://${ hostname }` );
		}
	);

	test( 'it returns a URL with path with a path provided', () => {
		mockCaplysoOriginQueryArg( '' );
		expect( getCalypsoUrl( '/start' ) ).toBe( 'https://wordpress.com/start' );
		expect( getCalypsoUrl( '/' ) ).toBe( 'https://wordpress.com/' );
		expect( getCalypsoUrl( '/post/foobar.wordpress.com' ) ).toBe(
			'https://wordpress.com/post/foobar.wordpress.com'
		);
	} );
} );
