/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { navigate } from '..';

describe( 'navigate', () => {
	let originalLocation: Location;
	let showSpy: jest.SpyInstance;

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
		showSpy = jest.spyOn( page, 'show' ).mockImplementation( () => undefined as never );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: originalLocation,
		} );
		showSpy.mockRestore();
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
} );
