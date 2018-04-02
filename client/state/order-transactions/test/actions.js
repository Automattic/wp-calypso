/** @format */

/**
 * Internal dependencies
 */
import { ORDER_TRANSACTION_FETCH, ORDER_TRANSACTION_SET } from 'state/action-types';

import { fetchOrderTransaction, setOrderTransaction } from '../actions';

describe( '/state/order-transactions/actions', () => {
	describe( 'fetchOrderTransaction()', () => {
		test( 'should return expected action.', () => {
			const orderId = 123;
			expect( fetchOrderTransaction( orderId ) ).toEqual( {
				type: ORDER_TRANSACTION_FETCH,
				orderId,
			} );
		} );
	} );

	describe( 'setOrderTransaction()', () => {
		const orderId = 123;
		const detail = {
			status: 'success',
		};
		test( 'should return expected action.', () => {
			expect( setOrderTransaction( orderId, detail ) ).toEqual( {
				type: ORDER_TRANSACTION_SET,
				orderId,
				detail,
			} );
		} );
	} );
} );
