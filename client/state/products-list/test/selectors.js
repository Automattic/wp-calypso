/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getProductDisplayCost } from '../selectors';

describe( 'selectors', () => {
	describe( 'getProductDisplayCost()', () => {
		it( 'should return null when the products list has not been fetched', () => {
			const state = deepFreeze( { productsList: { items: {} } } );

			expect( getProductDisplayCost( state, 'guided_transfer' ) ).to.be.null;
		} );

		it( 'should return the display cost', () => {
			const state = deepFreeze( {
				productsList: {
					items: {
						guided_transfer: {
							cost_display: 'A$169.00'
						}
					}
				}
			} );

			expect( getProductDisplayCost( state, 'guided_transfer' ) ).to.equal( 'A$169.00' );
		} );
	} );
} );
