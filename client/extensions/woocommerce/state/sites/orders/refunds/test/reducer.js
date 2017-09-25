/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import order from '../../test/fixtures/order';
import { isSaving } from '../reducer';
import { WOOCOMMERCE_ORDER_REFUND_CREATE, WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS, WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE } from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	describe( 'isSaving', () => {
		it( 'should have no change by default', () => {
			const newState = isSaving( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should store the currently refunding order', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_REFUND_CREATE,
				siteId: 123,
				orderId: 45,
			};
			const newState = isSaving( undefined, action );
			expect( newState ).to.eql( { 45: true } );
		} );

		it( 'should should show that the refund request has finished on success', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS,
				siteId: 123,
				orderId: 45,
				order,
			};
			const originalState = deepFreeze( { 45: true } );
			const newState = isSaving( originalState, action );
			expect( newState ).to.eql( { 45: false } );
		} );

		it( 'should should show that the refund request has finished on failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE,
				siteId: 123,
				orderId: 45,
				error: {},
			};
			const originalState = deepFreeze( { 45: true } );
			const newState = isSaving( originalState, action );
			expect( newState ).to.eql( { 45: false } );
		} );
	} );
} );
