/**
 * External dependencies
 */
import { expect } from 'chai';
import config from 'config';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { isLegacyRoute } from '../legacy-routes';

let features = [];

describe( 'legacy-routes', function() {
	describe( '#isLegacyRoute()', () => {
		before( () => {
			sinon.stub( config, 'isEnabled', ( flag ) => {
				return features.indexOf( flag ) > -1;
			} );
		} );

		after( () => {
			config.isEnabled.restore();
		} );

		it( 'should return true for /themes/sometheme', () => {
			expect( isLegacyRoute( '/themes/sometheme' ) ).to.be.true;
		} );

		it( 'should return true for /notifications', () => {
			expect( isLegacyRoute( '/notifications' ) ).to.be.true;
		} );

		it( 'should return false for /settings/general', () => {
			expect( isLegacyRoute( '/settings/general' ) ).to.be.false;
		} );

		it( 'should return true for / when reader is disabled', () => {
			expect( isLegacyRoute( '/' ) ).to.be.true;
		} );

		it( 'should return false for / when reader is enabled', () => {
			features = [ 'reader' ];
			expect( isLegacyRoute( '/' ) ).to.be.false;
		} );

		it( 'should return true for any path ending in .php', () => {
			expect( isLegacyRoute( '/test.php' ) ).to.be.true;
			expect( isLegacyRoute( 'test.php' ) ).to.be.true;
			expect( isLegacyRoute( '/some/nested/page.php' ) ).to.be.true;
		} );

		it( 'should return true for /plans when `manage/plans` feature flag disabled', () => {
			expect( isLegacyRoute( '/plans' ) ).to.be.true;
		} );

		it( 'should return false for /plans when `manage/plans` feature flag enabled', () => {
			features = [ 'manage/plans' ];
			expect( isLegacyRoute( '/plans' ) ).to.be.false;
		} );
	} );
} );
