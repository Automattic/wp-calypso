/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import createConfig from '../';

describe( 'index', () => {
	context( 'config without data', () => {
		const config = createConfig( {} );

		it( 'has to throw error when the provided key is undefined', () => {
			expect( () => config( 'keyA' ) ).to.throw( Error );
		} );

		it( 'has to return false when the feature flags are not specified', () => {
			const result = config.isEnabled( 'flagA' );

			expect( result ).to.be.false;
		} );
	} );

	context( 'config with data', () => {
		const config = createConfig( {
			keyA: 'value',
			features: {
				flagA: false,
				flagB: false,
				flagC: true
			}
		} );

		it( 'has to return value of the provided key', () => {
			const result = config( 'keyA' );

			expect( result ).to.equal( 'value' );
		} );

		it( 'has to return false when the provided feature flag is disabled', () => {
			const result = config.isEnabled( 'flagA' );

			expect( result ).to.be.false;
		} );

		it( 'has to return false when the provided feature flag is enabled', () => {
			const result = config.isEnabled( 'flagC' );

			expect( result ).to.be.true;
		} );
	} );
} );
