/** @format */

/**
 * Internal dependencies
 */
import {
	SOURCE_PAYMENT_TRANSACTION_DETAIL_FETCH,
	SOURCE_PAYMENT_TRANSACTION_DETAIL_SET,
} from 'state/action-types';
import detailReducer from '../reducer';

describe( 'state/transactions/source-payment/reducer', () => {
	describe( 'detailReducer()', () => {
		test( 'should store the detail field on receiving the set action.', () => {
			const orderId = 123;
			const detail = {
				status: 'great-status!',
			};
			const state = detailReducer( undefined, {
				type: SOURCE_PAYMENT_TRANSACTION_DETAIL_SET,
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

			const updated = detailReducer( state, {
				type: SOURCE_PAYMENT_TRANSACTION_DETAIL_FETCH,
				orderId,
			} );

			expect( updated ).toEqual( {} );
		} );
	} );
} );
