/**
 * External dependencies
 */
import config from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import isLegacyRoute from '../src';

jest.mock( '@automattic/calypso-config' );

let features = [];

describe( 'legacy-routes', () => {
	describe( '#isLegacyRoute()', () => {
		beforeAll( () => {
			config.isEnabled.mockImplementation( ( flag ) => {
				return features.indexOf( flag ) > -1;
			} );
		} );

		afterAll( () => {
			config.isEnabled.restore();
		} );

		test( 'should return false for /settings/general', () => {
			expect( isLegacyRoute( '/settings/general' ) ).toBeFalsy();
		} );

		test( 'should return true for / when reader is disabled', () => {
			// config.isEnabled( 'reader' ) === false
			features = [];
			expect( isLegacyRoute( '/' ) ).toBeTruthy();
		} );

		test( 'should return false for / when reader is enabled', () => {
			// config.isEnabled( 'reader' ) === true
			features = [ 'reader' ];
			expect( isLegacyRoute( '/' ) ).toBeFalsy();
		} );

		test( 'should return true for any path ending in .php', () => {
			expect( isLegacyRoute( '/test.php' ) ).toBeTruthy();
			expect( isLegacyRoute( 'test.php' ) ).toBeTruthy();
			expect( isLegacyRoute( '/some/nested/page.php' ) ).toBeTruthy();
		} );

		describe( 'when `me/my-profile` feature flag is enabled', () => {
			// config.isEnabled( 'me/my-profile' ) === true
			beforeEach( () => {
				features = [ 'me/my-profile' ];
			} );

			test( 'should return false for /me', () => {
				expect( isLegacyRoute( '/me' ) ).toBeFalsy();
			} );

			test( 'should return false for /me/billing', () => {
				expect( isLegacyRoute( '/me/billing' ) ).toBeFalsy();
			} );
		} );

		describe( 'when `me/my-profile` feature flag is disabled', () => {
			// config.isEnabled( 'me/my-profile' ) === false
			beforeEach( () => {
				features = [];
			} );

			test( 'should return true for /me', () => {
				expect( isLegacyRoute( '/me' ) ).toBeTruthy();
			} );

			test( 'should return false for /me/billing', () => {
				expect( isLegacyRoute( '/me/billing' ) ).toBeFalsy();
			} );
		} );
	} );
} );
