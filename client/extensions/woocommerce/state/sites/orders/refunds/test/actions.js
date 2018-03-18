/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { createRefundFailure, createRefundSuccess, sendRefund } from '../actions';
import {
	WOOCOMMERCE_ORDER_REFUND_CREATE,
	WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE,
	WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	const refund = {
		amount: 10,
		reason: 'Testing',
		api_refund: false,
	};

	describe( '#sendRefund()', () => {
		test( 'should return an action', () => {
			const onSuccess = { type: WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS };
			const onFailure = { type: WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE };
			const action = sendRefund( 123, 38, refund, onSuccess, onFailure );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_REFUND_CREATE,
				siteId: 123,
				orderId: 38,
				refund,
				onSuccess,
				onFailure,
			} );
		} );
	} );

	describe( '#createRefundSuccess', () => {
		test( 'should return a success action with the refund when request completes', () => {
			const action = createRefundSuccess( 123, 38, refund );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS,
				siteId: 123,
				orderId: 38,
				refund,
			} );
		} );
	} );

	describe( '#createRefundFailure', () => {
		test( 'should return a failure action with the error when a the request fails', () => {
			const error = new Error( 'Unable to create refund', {
				error: 'bad_json',
				message: 'Could not parse JSON request body.',
			} );
			const action = createRefundFailure( 234, 21, error );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE,
				siteId: 234,
				orderId: 21,
				error,
			} );
		} );
	} );
} );
