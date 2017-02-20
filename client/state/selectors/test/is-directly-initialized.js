/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isDirectlyInitialized } from '../';

describe( 'isDirectlyInitialized()', () => {
	it( 'should return the config object', () => {
		const initialized = isDirectlyInitialized( {
			directly: {
				isInitialized: true
			}
		} );
		expect( initialized ).to.be.true;
	} );
} );
