/** @format */

/**
 * Internal dependencies
 */
import {
	SOURCE_PAYMENT_TRANSACTION_DETAIL_FETCH,
	SOURCE_PAYMENT_TRANSACTION_DETAIL_SET,
} from 'state/action-types';

import { fetchSourcePaymentTransactionDetail, setSourcePaymentTransactionDetail } from '../actions';

describe( '/me/transactions/source-payment/actions', () => {
	describe( 'fetchSourcePaymentTransactionDetail()', () => {
		test( 'should return expected action.', () => {
			const orderId = 123;
			expect( fetchSourcePaymentTransactionDetail( orderId ) ).toEqual( {
				type: SOURCE_PAYMENT_TRANSACTION_DETAIL_FETCH,
				orderId,
			} );
		} );
	} );

	describe( 'setSourcePaymentTransactionDetail()', () => {
		const orderId = 123;
		const detail = {
			status: 'success',
		};
		test( 'should return expected action.', () => {
			expect( setSourcePaymentTransactionDetail( orderId, detail ) ).toEqual( {
				type: SOURCE_PAYMENT_TRANSACTION_DETAIL_SET,
				orderId,
				detail,
			} );
		} );
	} );
} );
