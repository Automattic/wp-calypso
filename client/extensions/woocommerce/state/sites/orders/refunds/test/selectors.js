/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isOrderRefunding, getOrderRefunds } from '../selectors';
import woocommerce, { refunds } from './fixtures/refunds';
const state = deepFreeze( { extensions: { woocommerce } } );

/*
 * state.extensions.woocommerce.sites has four sites:
 *  - site.one: nothing loaded yet
 *  - site.two: order and refunds loaded
 *  - site.three: saving a refund
 */

describe( 'selectors', () => {
	describe( '#getOrderRefunds', () => {
		test( 'should be empty array when woocommerce state is not available.', () => {
			expect( getOrderRefunds( state, 1, 'site.one' ) ).to.eql( [] );
		} );

		test( 'should be empty array when there are no refunds.', () => {
			expect( getOrderRefunds( state, 1, 'state.three' ) ).to.eql( [] );
		} );

		test( 'should get the list of refunds when available.', () => {
			expect( getOrderRefunds( state, 40, 'site.two' ) ).to.eql( refunds );
		} );
	} );

	describe( '#isOrderRefunding', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( isOrderRefunding( state, 1, 'site.one' ) ).to.be.false;
		} );

		test( 'should be false when this order refund is completed.', () => {
			expect( isOrderRefunding( state, 40, 'state.two' ) ).to.be.false;
		} );

		test( 'should be true when the order refund is submitted.', () => {
			expect( isOrderRefunding( state, 1, 'site.three' ) ).to.be.true;
		} );
	} );
} );
