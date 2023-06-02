/**
 * @jest-environment jsdom
 */

import { getCalypsoUrl } from '../src';

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

	test( 'it returns a URL with path with a path provided', () => {
		mockCaplysoOriginQueryArg( '' );
		expect( getCalypsoUrl( '/start' ) ).toBe( 'https://wordpress.com/start' );
		expect( getCalypsoUrl( '/' ) ).toBe( 'https://wordpress.com/' );
		expect( getCalypsoUrl( '/post/foobar.wordpress.com' ) ).toBe(
			'https://wordpress.com/post/foobar.wordpress.com'
		);
	} );
} );
