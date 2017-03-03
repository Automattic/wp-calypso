/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getDirectlyConfig } from '../';

describe( 'getDirectlyConfig()', () => {
	it( 'should return the config object', () => {
		const config = getDirectlyConfig( {
			directly: {
				config: { a: 1, b: 2 }
			}
		} );
		expect( config ).to.eql( { a: 1, b: 2 } );
	} );
} );
