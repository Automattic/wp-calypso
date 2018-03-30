/** @format */

/**
 * Internal dependencies
 */
import { ORDER_TRANSACTION_FETCH, ORDER_TRANSACTION_SET } from 'state/action-types';
import orderTransactions from '../reducer';

describe( 'state/order-transactions/reducer', () => {
	describe( 'orderTransactions()', () => {
		test( 'should store the detail field on receiving the set action.', () => {
			const orderId = 123;
			const detail = {
				status: 'great-status!',
			};
			const state = orderTransactions( undefined, {
				type: ORDER_TRANSACTION_SET,
				orderId,
				detail,
			} );

			expect( state ).toEqual( {
				[ orderId ]: detail,
			} );
		} );

		test( 'should clean the stored data if fetch again.', () => {
			const orderId = 123;
			const state = {
				[ orderId ]: {
					status: 'I am here long time ago.',
				},
			};

			const updated = orderTransactions( state, {
				type: ORDER_TRANSACTION_FETCH,
				orderId,
			} );

			expect( updated ).toEqual( {} );
		} );
	} );
} );
