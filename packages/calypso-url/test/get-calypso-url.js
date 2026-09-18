/**
 * @jest-environment jsdom
 */

import fs from 'fs';
import path from 'path';
import { getCalypsoUrl } from '../src';

const configDir = path.resolve( __dirname, '..', '..', '..', 'config' );

// This package can't read the Calypso config — it's also consumed from outside
// Calypso — so the allowed origins are hardcoded. Collect the hostnames Calypso
// is actually configured to run on, so the test below catches them drifting apart.
// Configs for the Dashboard and the other apps are excluded: they're separate
// deployments, and whether `calypso_origin` should accept them is an open question.
function getCalypsoConfigHostnames() {
	const otherApps = /^(dashboard|jetpack-cloud|a8c-for-agencies)-/;

	return fs
		.readdirSync( configDir )
		.filter(
			( file ) =>
				file.endsWith( '.json' ) &&
				! file.startsWith( '_' ) &&
				! otherApps.test( file ) &&
				! [ 'client.json', 'secrets.json', 'empty-secrets.json' ].includes( file )
		)
		.map(
			( file ) => JSON.parse( fs.readFileSync( path.join( configDir, file ), 'utf8' ) ).hostname
		)
		.filter( Boolean );
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

	test.each( [ ...new Set( getCalypsoConfigHostnames() ) ] )(
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
