/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isSending } from '../reducer';
import {
	WOOCOMMERCE_ORDER_INVOICE_SEND_FAILURE,
	WOOCOMMERCE_ORDER_INVOICE_SEND,
	WOOCOMMERCE_ORDER_INVOICE_SEND_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	describe( 'isInvoiceSending', () => {
		test( 'should have no change by default', () => {
			const newState = isSending( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the order ID', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_INVOICE_SEND,
				siteId: 123,
				orderId: 45,
			};
			const newState = isSending( undefined, action );
			expect( newState ).to.eql( { 45: true } );
		} );

		test( 'should should show that the invoice request has finished on success', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_INVOICE_SEND_SUCCESS,
				siteId: 123,
				orderId: 45,
				note: { id: 243 },
			};
			const originalState = deepFreeze( { 45: true } );
			const newState = isSending( originalState, action );
			expect( newState ).to.eql( { 45: false } );
		} );

		test( 'should should show that the invoice request has finished on failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_INVOICE_SEND_FAILURE,
				siteId: 123,
				orderId: 45,
				error: {},
			};
			const originalState = deepFreeze( { 45: true } );
			const newState = isSending( originalState, action );
			expect( newState ).to.eql( { 45: false } );
		} );
	} );
} );
