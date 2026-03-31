/**
 * @jest-environment jsdom
 */

import { wpcomLink, a4aLink, redirectToDashboardLink } from '../link';

jest.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => {
		const values: Record< string, string > = {
			wpcom_url: 'https://wordpress.com',
			env: 'production',
		};
		return values[ key ];
	};
	config.isEnabled = () => false;
	return { __esModule: true, default: config };
} );

jest.mock( '../../app/routing', () => ( {
	getCurrentDashboard: () => 'dotcom',
	getDashboardFromQuery: () => undefined,
	buildDashboardLink: ( _dashboard: string, path: string ) =>
		new URL( path.replace( /^\/\/+/, '/' ), 'https://my.wordpress.com' ).href,
} ) );

describe( 'wpcomLink', () => {
	test( 'should build a URL with the configured origin', () => {
		expect( wpcomLink( '/sites' ) ).toBe( 'https://wordpress.com/sites' );
	} );

	test( 'should reject protocol-relative paths', () => {
		expect( wpcomLink( '//evil.com' ) ).toBe( 'https://wordpress.com/evil.com' );
	} );

	test( 'should reject multiple leading slashes', () => {
		expect( wpcomLink( '///evil.com' ) ).toBe( 'https://wordpress.com/evil.com' );
	} );

	test( 'should handle empty path', () => {
		expect( wpcomLink( '' ) ).toBe( 'https://wordpress.com/' );
	} );

	test( 'should preserve valid paths with query params', () => {
		expect( wpcomLink( '/sites?foo=bar' ) ).toBe( 'https://wordpress.com/sites?foo=bar' );
	} );
} );

describe( 'a4aLink', () => {
	test( 'should build a URL with the agencies origin', () => {
		expect( a4aLink( '/sites' ) ).toBe( 'https://agencies.automattic.com/sites' );
	} );

	test( 'should reject protocol-relative paths', () => {
		expect( a4aLink( '//evil.com' ) ).toBe( 'https://agencies.automattic.com/evil.com' );
	} );

	test( 'should reject multiple leading slashes', () => {
		expect( a4aLink( '///evil.com' ) ).toBe( 'https://agencies.automattic.com/evil.com' );
	} );
} );

describe( 'redirectToDashboardLink', () => {
	const originalLocation = window.location;

	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			value: {
				href: 'https://wordpress.com/sites',
				origin: 'https://wordpress.com',
			},
			writable: true,
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
		} );
	} );

	test( 'should build a redirect link from the current path', () => {
		expect( redirectToDashboardLink() ).toBe( 'https://my.wordpress.com/sites' );
	} );

	test( 'should prevent protocol-relative redirect when URL contains double slashes', () => {
		Object.defineProperty( window, 'location', {
			value: {
				href: 'https://wordpress.com//evil.com/path',
				origin: 'https://wordpress.com',
			},
			writable: true,
		} );

		const result = redirectToDashboardLink();
		const parsed = new URL( result );
		expect( parsed.hostname ).toBe( 'my.wordpress.com' );
	} );
} );
