/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { sendOrderInvoice, orderInvoiceFailure, orderInvoiceSuccess } from '../actions';
import {
	WOOCOMMERCE_ORDER_INVOICE_SEND_FAILURE,
	WOOCOMMERCE_ORDER_INVOICE_SEND,
	WOOCOMMERCE_ORDER_INVOICE_SEND_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#sendOrderInvoice()', () => {
		test( 'should return an action', () => {
			const action = sendOrderInvoice( 123, 38 );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_INVOICE_SEND,
				siteId: 123,
				orderId: 38,
			} );
		} );
	} );

	describe( '#orderInvoiceSuccess', () => {
		test( 'should return a success action with the customer list when request completes', () => {
			const note = {
				id: 16,
				note: 'Order details manually sent to customer.',
			};
			const action = orderInvoiceSuccess( 123, 38, note );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_INVOICE_SEND_SUCCESS,
				siteId: 123,
				orderId: 38,
				note,
			} );
		} );

		test( 'should return a failure action if the response is an error object', () => {
			const note = { code: 'rest_no_route' };
			const action = orderInvoiceSuccess( 123, 38, note );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_INVOICE_SEND_FAILURE,
				siteId: 123,
				orderId: 38,
				error: { code: 'rest_no_route' },
			} );
		} );
	} );

	describe( '#orderInvoiceFailure', () => {
		test( 'should return a failure action with the error when a the request fails', () => {
			const error = {
				code: 'woocommerce_api_cannot_create_order_note',
				message: 'Cannot create order note, please try again.',
			};
			const action = orderInvoiceFailure( 234, 21, error );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_INVOICE_SEND_FAILURE,
				siteId: 234,
				orderId: 21,
				error,
			} );
		} );
	} );
} );
