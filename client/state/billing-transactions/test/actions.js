import nock from 'nock';
import {
	BILLING_TRANSACTIONS_RECEIVE,
	BILLING_TRANSACTIONS_REQUEST,
	BILLING_TRANSACTIONS_REQUEST_SUCCESS,
	BILLING_TRANSACTIONS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { requestBillingTransactions, sendBillingReceiptEmail } from '../actions';

describe( 'actions', () => {
	let spy;

	beforeEach( () => {
		spy = jest.fn();
	} );

	const endpointLimit = 600;

	describe( '#requestBillingTransactions()', () => {
		describe( 'success', () => {
			const successResponse = {
				billing_history: [
					{
						id: '12345678',
						amount: '$1.23',
						date: '2016-12-12T11:22:33+0000',
						tax: '$0.20',
						subtotal: '$1.03',
					},
				],
				billing_history_total: 1,
				upcoming_charges: [
					{
						id: '87654321',
						amount: '$4.56',
						tax: '$0.55',
						subtotal: '$4.01',
						date: '2016-12-12T11:22:33+0000',
					},
				],
			};

			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.3/me/billing-history?limit=' + endpointLimit )
				.reply( 200, successResponse );

			test( 'should dispatch fetch action when thunk triggered', async () => {
				await requestBillingTransactions()( spy );

				expect( spy ).toHaveBeenCalledWith( {
					type: BILLING_TRANSACTIONS_REQUEST,
				} );

				// should dispatch receive action when request completes'
				expect( spy ).toHaveBeenCalledWith( {
					type: BILLING_TRANSACTIONS_RECEIVE,
					past: successResponse.billing_history,
					upcoming: successResponse.upcoming_charges,
				} );

				// should dispatch request success action when request completes'
				expect( spy ).toHaveBeenCalledWith( {
					type: BILLING_TRANSACTIONS_REQUEST_SUCCESS,
				} );
			} );
		} );

		describe( 'success with multiple calls', () => {
			// Let's generate more than "endpointLimit" past transactions
			const billing_history = [];
			for ( let i = 0; i < 2 * endpointLimit - 1; i++ ) {
				billing_history.push( {
					id: Math.floor( Math.random() * 10000 ),
					amount: '$1.23',
					date: '2016-12-12T11:22:33+0000',
					tax: '$0.20',
					subtotal: '$1.03',
				} );
			}

			const totalSuccessResponse = {
				billing_history,
				billing_history_total: billing_history.length,
				upcoming_charges: [
					{
						id: '87654321',
						amount: '$4.56',
						tax: '$0.55',
						subtotal: '$4.01',
						date: '2016-12-12T11:22:33+0000',
					},
				],
			};

			const successResponse1 = {
				billing_history: billing_history.slice( 0, endpointLimit ),
				billing_history_total: totalSuccessResponse.billing_history_total,
				upcoming_charges: totalSuccessResponse.upcoming_charges,
			};

			const successResponse2 = {
				billing_history: billing_history.slice( endpointLimit ),
				billing_history_total: totalSuccessResponse.billing_history_total,
				upcoming_charges: [],
			};

			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.3/me/billing-history?limit=' + endpointLimit )
				.reply( 200, successResponse1 );

			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.3/me/billing-history?limit=' + endpointLimit + '&offset=' + endpointLimit )
				.reply( 200, successResponse2 );

			test( 'should dispatch fetch action when thunk triggered', async () => {
				await requestBillingTransactions()( spy );

				expect( spy ).toHaveBeenCalledWith( {
					type: BILLING_TRANSACTIONS_REQUEST,
				} );

				// should dispatch receive action when request completes'
				expect( spy ).toHaveBeenCalledWith( {
					type: BILLING_TRANSACTIONS_RECEIVE,
					past: totalSuccessResponse.billing_history,
					upcoming: totalSuccessResponse.upcoming_charges,
				} );

				// should dispatch request success action when request completes'
				expect( spy ).toHaveBeenCalledWith( {
					type: BILLING_TRANSACTIONS_REQUEST_SUCCESS,
				} );
			} );
		} );

		describe( 'failure', () => {
			const message =
				'An active access token must be used to query information about the current user.';

			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.3/me/billing-history?limit=' + endpointLimit )
				.reply( 403, {
					error: 'authorization_required',
					message,
				} );

			test( 'should dispatch request failure action when request fails', async () => {
				await requestBillingTransactions()( spy );
				expect( spy ).toHaveBeenCalledWith( {
					type: BILLING_TRANSACTIONS_REQUEST_FAILURE,
					error: expect.objectContaining( {
						message,
					} ),
				} );
			} );
		} );
	} );

	describe( '#sendBillingReceiptEmail()', () => {
		const receiptId = 12345678;

		describe( 'success', () => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/me/billing-history/receipt/' + receiptId + '/email' )
				.reply( 200, { success: true } );

			test( 'should dispatch send success action when request completes', async () => {
				const { notice, type } = successNotice( 'Your receipt was sent by email successfully.' );
				await sendBillingReceiptEmail( receiptId )( spy );
				expect( spy ).toHaveBeenCalledWith( {
					notice: {
						...notice,
						noticeId: expect.any( String ),
					},
					type,
				} );
			} );
		} );

		describe( 'failure', () => {
			const message =
				'An active access token must be used to query information about the current user.';

			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/me/billing-history/receipt/' + receiptId + '/email' )
				.reply( 403, {
					error: 'authorization_required',
					message,
				} );

			test( 'should dispatch send failure action when request fails', async () => {
				const { notice, type } = errorNotice(
					'There was a problem sending your receipt. Please try again later or contact support.'
				);
				await sendBillingReceiptEmail( receiptId )( spy );
				expect( spy ).toHaveBeenCalledWith( {
					notice: {
						...notice,
						noticeId: expect.any( String ),
					},
					type,
				} );
			} );
		} );
	} );
} );
