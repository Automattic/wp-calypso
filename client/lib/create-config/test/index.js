/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import createConfig from '../';

describe( 'index', () => {
	describe( 'config without data', () => {
		const config = createConfig( {} );

		test( 'has to return false when the feature flags are not specified', () => {
			const result = config.isEnabled( 'flagA' );

			expect( result ).to.be.false;
		} );
	} );

	describe( 'config with data', () => {
		const config = createConfig( {
			keyA: 'value',
			features: {
				flagA: false,
				flagB: false,
				flagC: true,
			},
		} );

		test( 'has to return value of the provided key', () => {
			const result = config( 'keyA' );

			expect( result ).to.equal( 'value' );
		} );

		test( 'has to return false when the provided feature flag is disabled', () => {
			const result = config.isEnabled( 'flagA' );

			expect( result ).to.be.false;
		} );

		test( 'has to return false when the provided feature flag is enabled', () => {
			const result = config.isEnabled( 'flagC' );

			expect( result ).to.be.true;
		} );

		describe( 'error cases', () => {
			const NODE_ENV = process.env.NODE_ENV;
			const fakeKey = 'where did all the errors go?';

			afterEach( () => ( process.env.NODE_ENV = NODE_ENV ) );

			test( "should throw an error when given key doesn't exist (NODE_ENV == development)", () => {
				process.env.NODE_ENV = 'development';

				expect( () => config( fakeKey ) ).to.throw( ReferenceError );
			} );

			test( "should not throw an error when given key doesn't exist (NODE_ENV != development)", () => {
				const envs = [ 'client', 'desktop', 'horizon', 'production', 'stage', 'test', 'wpcalypso' ];

				envs.forEach( ( env ) => {
					process.env.NODE_ENV = env;

					expect( process.env.NODE_ENV ).to.equal( env );
					expect( () => config( fakeKey ) ).to.not.throw( Error );
				} );
			} );
		} );
	} );

	describe( 'config utilities', () => {
		let config;

		beforeEach( () => {
			config = createConfig( {
				features: {
					flagA: false,
					flagB: false,
					flagC: true,
				},
			} );
		} );

		afterEach( () => {
			config = null;
		} );

		describe( 'isEnabled', () => {
			test( 'it correctly reports status of features', () => {
				expect( config.isEnabled( 'flagA' ) ).to.be.false;
				expect( config.isEnabled( 'flagC' ) ).to.be.true;
			} );

			test( 'it defaults to "false" when feature is not defined', () => {
				expect( config.isEnabled( 'flagXYZ' ) ).to.be.false;
			} );
		} );

		describe( 'enable', () => {
			test( 'it can enable features which are not yet set', () => {
				config.enable( 'flagD' );
				config.enable( 'flagE' );
				expect( config.isEnabled( 'flagD' ) ).to.be.true;
				expect( config.isEnabled( 'flagE' ) ).to.be.true;
			} );

			test( 'it can toggle existing features to enable them', () => {
				config.enable( 'flagA' );
				expect( config.isEnabled( 'flagA' ) ).to.be.true;
			} );
		} );

		describe( 'disable', () => {
			test( 'it can toggle existing features to disable them', () => {
				config.disable( 'flagC' );
				expect( config.isEnabled( 'flagC' ) ).to.be.false;
			} );

			test( 'it retains existing disable setting for features that are already disabled', () => {
				config.disable( 'flagA' );
				expect( config.isEnabled( 'flagA' ) ).to.be.false;
			} );

			test( 'it will handle setting new features to a initial disabled state', () => {
				config.disable( 'flagZXY' );
				expect( config.isEnabled( 'flagZXY' ) ).to.be.false;
			} );
		} );
	} );
} );
