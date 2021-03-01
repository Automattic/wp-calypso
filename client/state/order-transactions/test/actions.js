/**
 * Internal dependencies
 */
import {
	ORDER_TRANSACTION_FETCH,
	ORDER_TRANSACTION_FETCH_ERROR,
	ORDER_TRANSACTION_SET,
} from 'calypso/state/action-types';

import { fetchOrderTransaction, setOrderTransaction, setOrderTransactionError } from '../actions';

describe( '/state/order-transactions/actions', () => {
	const orderId = 123;

	describe( 'fetchOrderTransaction()', () => {
		test( 'should return expected action.', () => {
			expect( fetchOrderTransaction( orderId ) ).toEqual( {
				type: ORDER_TRANSACTION_FETCH,
				orderId,
			} );
		} );
	} );

	describe( 'setOrderTransaction()', () => {
		const transaction = {
			status: 'success',
		};
		test( 'should return expected action.', () => {
			expect( setOrderTransaction( orderId, transaction ) ).toEqual( {
				type: ORDER_TRANSACTION_SET,
				orderId,
				transaction,
			} );
		} );
	} );

	describe( 'setOrderTransactionError()', () => {
		test( 'should return expected action.', () => {
			const error = {
				message: 'something goes wrong!',
			};
			expect( setOrderTransactionError( orderId, error ) ).toEqual( {
				type: ORDER_TRANSACTION_FETCH_ERROR,
				orderId,
				error,
			} );
		} );
	} );
} );
