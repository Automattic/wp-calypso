import config from '@automattic/calypso-config';
import sinon from 'sinon';
import { isLegacyRoute } from '../legacy-routes';

let features = [];

describe( 'legacy-routes', () => {
	describe( '#isLegacyRoute()', () => {
		beforeAll( () => {
			sinon.stub( config, 'isEnabled' ).callsFake( ( flag ) => {
				return features.indexOf( flag ) > -1;
			} );
		} );

		afterAll( () => {
			config.isEnabled.restore();
		} );

		test( 'should return false for /settings/general', () => {
			expect( isLegacyRoute( '/settings/general' ) ).toBe( false );
		} );

		test( 'should return true for / when reader is disabled', () => {
			// config.isEnabled( 'reader' ) === false
			features = [];
			expect( isLegacyRoute( '/' ) ).toBe( true );
		} );

		test( 'should return false for / when reader is enabled', () => {
			// config.isEnabled( 'reader' ) === true
			features = [ 'reader' ];
			expect( isLegacyRoute( '/' ) ).toBe( false );
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
