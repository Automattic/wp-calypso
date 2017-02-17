/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getConfig,
	isInitialized,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getConfig()', () => {
		it( 'should return the config object', () => {
			const config = getConfig( {
				directly: {
					config: { a: 1, b: 2 }
				}
			} );
			expect( config ).to.eql( { a: 1, b: 2 } );
		} );
	} );

	describe( '#isInitialized()', () => {
		it( 'should return the config object', () => {
			const initialized = isInitialized( {
				directly: {
					isInitialized: true
				}
			} );
			expect( initialized ).to.be.true;
		} );
	} );
} );
