/**
 * Internal dependencies
 */
import {
	ORDER_TRANSACTION_FETCH,
	ORDER_TRANSACTION_FETCH_ERROR,
	ORDER_TRANSACTION_SET,
} from 'calypso/state/action-types';

import { items, isFetching, errors } from '../reducer';

describe( 'state/order-transactions/reducer', () => {
	const orderId = 123;

	describe( 'items()', () => {
		test( 'should store the transaction field on receiving the set action.', () => {
			const transaction = {
				status: 'great-status!',
			};
			const state = items( undefined, {
				type: ORDER_TRANSACTION_SET,
				orderId,
				transaction,
			} );

			expect( state ).toEqual( {
				[ orderId ]: transaction,
			} );
		} );

		test( 'should clean the stored data if fetch again.', () => {
			const state = {
				[ orderId ]: {
					status: 'I am here long time ago.',
				},
			};

			const updated = items( state, {
				type: ORDER_TRANSACTION_FETCH,
				orderId,
			} );

			expect( updated ).toEqual( {} );
		} );
	} );

	describe( 'error()', () => {
		test( 'should store the error field on receiving the error action.', () => {
			const error = {
				message: 'something goes wrong!',
			};
			const state = errors( undefined, {
				type: ORDER_TRANSACTION_FETCH_ERROR,
				orderId,
				error,
			} );

			expect( state ).toEqual( {
				[ orderId ]: error,
			} );
		} );

		test( 'should be cleared on receiving the set action.', () => {
			const state = {
				[ orderId ]: {
					message: 'hmm. I should be cleaned.',
				},
			};

			const updated = errors( state, {
				type: ORDER_TRANSACTION_SET,
				orderId,
			} );

			expect( updated ).toEqual( {} );
		} );

		test( 'should be cleared on receiving the fetch action.', () => {
			const state = {
				[ orderId ]: {
					message: 'hmm. I too should be cleaned.',
				},
			};

			const updated = errors( state, {
				type: ORDER_TRANSACTION_FETCH,
				orderId,
			} );

			expect( updated ).toEqual( {} );
		} );
	} );

	describe( 'isFetching()', () => {
		test( 'should be set on receiving the fetch action.', () => {
			const state = isFetching( undefined, {
				type: ORDER_TRANSACTION_FETCH,
				orderId,
			} );

			expect( state ).toEqual( {
				[ orderId ]: true,
			} );
		} );

		test( 'should be cleared on receiving the set action.', () => {
			const state = {
				[ orderId ]: true,
			};

			const updated = isFetching( state, {
				type: ORDER_TRANSACTION_SET,
				orderId,
			} );

			expect( updated ).toEqual( {} );
		} );

		test( 'should be cleared on receiving the error action.', () => {
			const state = {
				[ orderId ]: true,
			};

			const updated = isFetching( state, {
				type: ORDER_TRANSACTION_SET,
				orderId,
			} );

			expect( updated ).toEqual( {} );
		} );
	} );
} );
