import config from '@automattic/calypso-config';
import { isLegacyRoute } from '../legacy-routes';

const features = [];

describe( 'legacy-routes', () => {
	describe( '#isLegacyRoute()', () => {
		beforeAll( () => {
			jest.spyOn( config, 'isEnabled' ).mockImplementation( ( flag ) => {
				return features.indexOf( flag ) > -1;
			} );
		} );

		test( 'should return false for /settings/general', () => {
			expect( isLegacyRoute( '/settings/general' ) ).toBe( false );
		} );

		test( 'should return true for any path ending in .php', () => {
			expect( isLegacyRoute( '/test.php' ) ).toBe( true );
			expect( isLegacyRoute( 'test.php' ) ).toBe( true );
			expect( isLegacyRoute( '/some/nested/page.php' ) ).toBe( true );
		} );

		test( 'should return false for /me', () => {
			expect( isLegacyRoute( '/me' ) ).toBe( false );
		} );

		test( 'should return false for /me/billing', () => {
			expect( isLegacyRoute( '/me/billing' ) ).toBe( false );
		} );
	} );
} );
