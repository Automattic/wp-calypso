/**
 * @vitest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { type MockInstance, vi } from 'vitest';
import { navigate } from '..';

describe( 'navigate', () => {
	let originalLocation: Location;
	let showSpy: MockInstance;
	let openSpy: MockInstance;

	beforeEach( () => {
		originalLocation = window.location;
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: {
				href: 'http://localhost/sites',
				origin: 'http://localhost',
				pathname: '/sites',
			},
		} );
		showSpy = vi.spyOn( page, 'show' ).mockImplementation( () => undefined as never );
		openSpy = vi.spyOn( window, 'open' ).mockImplementation( () => null );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: originalLocation,
		} );
		showSpy.mockRestore();
		openSpy.mockRestore();
		page.current = '';
	} );

	it( 'does a full page load for same-origin paths when the page.js router is not running', () => {
		page.current = '';

		navigate( '/me/account' );

		expect( window.location.href ).toBe( '/me/account' );
		expect( showSpy ).not.toHaveBeenCalled();
	} );

	it( 'uses client-side routing for same-origin paths when the page.js router is running', () => {
		page.current = '/sites';

		navigate( '/me/account' );

		expect( showSpy ).toHaveBeenCalledWith( '/me/account' );
		expect( window.location.href ).toBe( 'http://localhost/sites' );
	} );

	it( 'opens external https URLs', () => {
		navigate( 'https://example.com/' );

		expect( openSpy ).toHaveBeenCalledWith( expect.stringContaining( 'example.com' ), '_self' );
	} );

	it.each( [
		'javascript:alert(1)',
		'JaVaScRiPt:%0Aalert(1)',
		' javascript:alert(1)',
		'data:text/html,<script>alert(1)</script>',
	] )( 'does not navigate to %s', ( path ) => {
		page.current = '/sites';

		navigate( path );
		navigate( path, true );
		navigate( path, false, true );

		expect( openSpy ).not.toHaveBeenCalled();
		expect( showSpy ).not.toHaveBeenCalled();
		expect( window.location.href ).toBe( 'http://localhost/sites' );
	} );
} );
