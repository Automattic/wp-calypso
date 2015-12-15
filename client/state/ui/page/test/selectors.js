/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getPageState } from '../selectors';

describe( 'selectors', () => {
	describe( '#getPageState()', () => {
		it( 'should return the current page state value', () => {
			const value = getPageState( {
				ui: {
					page: {
						foo: 'bar'
					}
				}
			}, 'foo' );

			expect( value ).to.be.equal( 'bar' );
		} );
	} );
} );
