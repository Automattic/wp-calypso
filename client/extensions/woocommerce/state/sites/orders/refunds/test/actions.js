/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	createRefundFailure,
	createRefundSuccess,
	fetchRefunds,
	fetchRefundsFailure,
	fetchRefundsSuccess,
	sendRefund,
} from '../actions';
import {
	WOOCOMMERCE_ORDER_REFUND_CREATE,
	WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE,
	WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS,
	WOOCOMMERCE_ORDER_REFUNDS_REQUEST,
	WOOCOMMERCE_ORDER_REFUNDS_REQUEST_SUCCESS,
	WOOCOMMERCE_ORDER_REFUNDS_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	const refund = {
		amount: 10,
		reason: 'Testing',
		api_refund: false,
	};

	describe( '#fetchRefunds()', () => {
		test( 'should return an action', () => {
			const action = fetchRefunds( 123, 38 );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_REFUNDS_REQUEST,
				siteId: 123,
				orderId: 38,
			} );
		} );
	} );

	describe( '#fetchRefundsFailure()', () => {
		test( 'should return an action', () => {
			const action = fetchRefundsFailure( 123, 38, {} );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_REFUNDS_REQUEST_FAILURE,
				siteId: 123,
				orderId: 38,
				error: {},
			} );
		} );
	} );

	describe( '#fetchRefundsSuccess()', () => {
		test( 'should return an action', () => {
			const action = fetchRefundsSuccess( 123, 38, [ refund ] );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_REFUNDS_REQUEST_SUCCESS,
				siteId: 123,
				orderId: 38,
				refunds: [ refund ],
			} );
		} );
	} );

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
