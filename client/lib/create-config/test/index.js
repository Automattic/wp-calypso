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

		context( 'error cases', () => {
			const NODE_ENV = process.env.NODE_ENV;
			const fakeKey = 'where did all the errors go?';

			afterEach( () => process.env.NODE_ENV = NODE_ENV );

			it( `should throw an error when given key doesn't exist (NODE_ENV == development)`, () => {
				process.env.NODE_ENV = 'development';

				expect( () => config( fakeKey ) ).to.throw( ReferenceError );
			} );

			it( `should not throw an error when given key doesn't exist (NODE_ENV != development)`, () => {
				const envs = [
					'client',
					'desktop',
					'horizon',
					'production',
					'stage',
					'test',
					'wpcalypso',
				];

				envs.forEach( env => {
					process.env.NODE_ENV = env;

					expect( process.env.NODE_ENV ).to.equal( env );
					expect( () => config( fakeKey ) ).to.not.throw( Error );
				} );
			} );
		} );
	} );
} );
