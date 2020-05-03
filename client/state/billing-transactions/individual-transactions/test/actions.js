/**
 * Internal dependencies
 */
import { requestBillingTransaction, clearBillingTransactionError } from '../actions';
import {
	BILLING_TRANSACTION_ERROR_CLEAR,
	BILLING_TRANSACTION_RECEIVE,
	BILLING_TRANSACTION_REQUEST,
	BILLING_TRANSACTION_REQUEST_FAILURE,
	BILLING_TRANSACTION_REQUEST_SUCCESS,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	describe( '#requestBillingTransaction', () => {
		const transactionId = 12345678;

		describe( 'success', () => {
			const receiptData = {
				id: '18689989',
				service: 'Store Services',
				amount: '$6.45',
				tax: '$0.44',
				subtotal: '$6.01',
				icon: 'https://developer.files.wordpress.com/2018/02/wpcom-logo-420.png',
				date: '2017-09-26T14:50:12+0000',
				desc: '',
				org: 'Automattic, Inc',
				url: 'https://wordpress.org/plugins/woocommerce-services/',
				support: 'https://woocommerce.com/my-account/create-a-ticket/',
				pay_ref: 'stripe:1234',
				pay_part: 'stripe',
				cc_type: 'mastercard',
				cc_num: '4444',
				cc_name: 'name surname',
				cc_email: '',
				credit: '',
				items: [
					{
						id: '22956711',
						type: 'new purchase',
						type_localized: 'New Purchase',
						domain: '',
						amount: '$6.45',
						tax: '$0.44',
						subtotal: '$6.01',
						raw_amount: 6.45,
						raw_tax: 0.44,
						raw_subtotal: 6.01,
						currency: 'USD',
						product: 'connect-label',
						product_slug: 'connect-label',
						variation: 'Shipping Label',
						variation_slug: 'connect-label-usps',
					},
				],
			};

			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/billing-history/receipt/' + transactionId + '?format=display' )
					.reply( 200, receiptData );
			} );

			test( 'should dispatch request action', () => {
				const dispatch = jest.fn();
				requestBillingTransaction( transactionId )( dispatch );

				expect( dispatch ).toHaveBeenCalledWith( {
					type: BILLING_TRANSACTION_REQUEST,
					transactionId,
				} );
			} );

			test( 'should dispatch success action', () => {
				const dispatch = jest.fn();
				return requestBillingTransaction( transactionId )( dispatch ).then( () => {
					expect( dispatch ).toHaveBeenCalledWith( {
						type: BILLING_TRANSACTION_REQUEST_SUCCESS,
						transactionId,
					} );

					expect( dispatch ).toHaveBeenCalledWith( {
						type: BILLING_TRANSACTION_RECEIVE,
						transactionId,
						receipt: receiptData,
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/billing-history/receipt/' + transactionId + '?format=display' )
					.reply( 403, {
						error: 'authorization_required',
					} );
			} );

			test( 'should dispatch failure action', () => {
				const dispatch = jest.fn();
				return requestBillingTransaction( transactionId )( dispatch ).then( () => {
					const actionArgument = dispatch.mock.calls[ 1 ][ 0 ];
					expect( actionArgument ).toMatchObject( {
						type: BILLING_TRANSACTION_REQUEST_FAILURE,
						transactionId,
					} );
					expect( actionArgument.error ).toMatchObject( {
						error: 'authorization_required',
					} );
				} );
			} );
		} );
	} );

	test( '#clearBillingTransactionError', () => {
		const transactionId = 12345678;
		const action = clearBillingTransactionError( transactionId );
		expect( action ).toEqual( {
			type: BILLING_TRANSACTION_ERROR_CLEAR,
			transactionId,
		} );
	} );
} );
