/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import config from '@automattic/calypso-config';

jest.mock( '@automattic/calypso-config' );

/**
 * Internal dependencies
 */
import { isExternal } from '../src';

// keep a copy of the window object to restore
// it at the end of the tests
const oldWindowLocation = window.location;

describe( 'isExternal', () => {
	beforeAll( () => {
		config.mockImplementation( ( flag ) => {
			if ( flag === 'hostname' ) {
				return 'calypso.localhost';
			}
		} );
		config.isEnabled.mockImplementation( ( flag ) => {
			if ( flag === 'reader' || flag === 'me/my-profile' ) {
				return true;
			}
			return false;
		} );

		delete window.location;
		window.location = {
			hostname: 'example.com',
		};
	} );

	afterAll( () => {
		config.isEnabled.restore();
		config.restore();

		// restore `window.location` to the original `jsdom`
		// `Location` object
		window.location = oldWindowLocation;
	} );

	test( 'should return false for relative path-only url', () => {
		const source = '/relative';

		const actual = isExternal( source );

		expect( actual ).toBe( false );
	} );

	test( 'should return false for relative query-only url', () => {
		const source = '?foo=bar';

		const actual = isExternal( source );

		expect( actual ).toBe( false );
	} );

	test( 'should return true for url without http', () => {
		const urlWithoutHttp = 'wordpress.com/support';
		const actual = isExternal( urlWithoutHttp );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for url without http and path', () => {
		const urlWithoutHttp = 'wordpress.com/support/start';
		const actual = isExternal( urlWithoutHttp );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for url without http and // path', () => {
		const urlWithoutHttp = 'wordpress.com/support//start';
		const actual = isExternal( urlWithoutHttp );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for just external relative // path', () => {
		const urlWithoutHttp = '//manage';
		const actual = isExternal( urlWithoutHttp );
		expect( actual ).toBe( true );
	} );

	describe( 'with global.window (test against window.location.hostname)', () => {
		// window.location.hostname === 'example.com'
		test( 'should return false for for internal protocol-relative url', () => {
			const source = '//example.com';

			const actual = isExternal( source );

			expect( actual ).toBe( false );
		} );

		test( 'should return true for for external protocol-relative url', () => {
			const source = '//some-other-site.com';

			const actual = isExternal( source );

			expect( actual ).toBe( true );
		} );

		test( 'should return false for internal url', () => {
			const source = 'https://example.com';

			const actual = isExternal( source );

			expect( actual ).toBe( false );
		} );

		test( 'should return true for external url', () => {
			const source = 'https://not-example.com';

			const actual = isExternal( source );

			expect( actual ).toBe( true );
		} );

		test( 'should return false for internal path without http', () => {
			const urlWithoutHttp = 'example.com//me';
			const actual = isExternal( urlWithoutHttp );
			expect( actual ).toBe( false );
		} );

		test( 'should return true for internal but legacy path with http', () => {
			const urlWithoutHttp = 'http://example.com/manage';
			const actual = isExternal( urlWithoutHttp );
			expect( actual ).toBe( true );
		} );

		test( 'should return true for internal but legacy path without http', () => {
			const urlWithoutHttp = 'example.com/manage';
			const actual = isExternal( urlWithoutHttp );
			expect( actual ).toBe( true );
		} );

		test( 'should return true for subdomains', () => {
			const source = '//ns1.example.com';
			const actual = isExternal( source );
			expect( actual ).toBe( true );
		} );
	} );

	describe( 'without global.window (test against config hostname)', () => {
		test( 'should return false for internal protocol-relative url', () => {
			const source = '//calypso.localhost';

			const actual = isExternal( source );

			expect( actual ).toBe( false );
		} );

		test( 'should return true for external protocol-relative url', () => {
			const source = '//some-other-site.com';

			const actual = isExternal( source );

			expect( actual ).toBe( true );
		} );

		test( 'should return false for internal url', () => {
			const source = 'https://calypso.localhost/me';

			const actual = isExternal( source );

			expect( actual ).toBe( false );
		} );

		test( 'should return true for external url', () => {
			const source = 'https://not.localhost/me';

			const actual = isExternal( source );

			expect( actual ).toBe( true );
		} );
	} );
} );
