/** @format */

/**
 * Internal dependencies
 */
import { fetchSourcePaymentTransactionDetail, onSuccess, onError } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { setSourcePaymentTransactionDetail } from 'state/transactions/source-payment/actions';

// we are mocking impure-lodash here, so that conciergeShiftsFetchError() will contain the expected id in the tests
jest.mock( 'lib/impure-lodash', () => ( {
	uniqueId: () => 'mock-unique-id',
} ) );

describe( 'wpcom-api', () => {
	describe( 'me/transactions/source-payment', () => {
		describe( 'fetchSourcePaymentTransactionDetail()', () => {
			test( 'should return the expected http request action.', () => {
				const action = {
					orderId: 123,
				};

				expect( fetchSourcePaymentTransactionDetail( action ) ).toEqual(
					http(
						{
							method: 'GET',
							path: `/me/transactions/source-payment/${ action.orderId }`,
							apiNamespace: 'rest/v1',
						},
						action
					)
				);
			} );
		} );

		describe( 'onSuccess()', () => {
			test( 'should return the expected setting action for populating state.', () => {
				const action = {
					orderId: 123,
				};
				const detail = {
					status: 'profit!',
				};

				expect( onSuccess( action, detail ) ).toEqual(
					setSourcePaymentTransactionDetail( action.orderId, detail )
				);
			} );
		} );

		describe( 'onError()', () => {
			test( 'should return the expected error notice action.', () => {
				expect( onError() ).toEqual(
					errorNotice( 'We have problems fetching your payment status. Please try again later.' )
				);
			} );
		} );
	} );
} );
