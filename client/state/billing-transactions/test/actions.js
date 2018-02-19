/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	requestBillingTransaction,
	requestBillingTransactions,
	sendBillingReceiptEmail,
} from '../actions';
import {
	BILLING_RECEIPT_EMAIL_SEND,
	BILLING_RECEIPT_EMAIL_SEND_FAILURE,
	BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
	BILLING_RECEIPT_REQUEST,
	BILLING_RECEIPT_REQUEST_FAILURE,
	BILLING_RECEIPT_REQUEST_SUCCESS,
	BILLING_TRANSACTIONS_RECEIVE,
	BILLING_TRANSACTIONS_REQUEST,
	BILLING_TRANSACTIONS_REQUEST_SUCCESS,
	BILLING_TRANSACTIONS_REQUEST_FAILURE,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( sandbox => ( spy = sandbox.spy() ) );

	describe( '#requestBillingTransactions()', () => {
		describe( 'success', () => {
			const successResponse = {
				billing_history: [
					{
						id: '12345678',
						amount: '$1.23',
						date: '2016-12-12T11:22:33+0000',
					},
				],
				upcoming_charges: [
					{
						id: '87654321',
						amount: '$4.56',
						date: '2016-12-12T11:22:33+0000',
					},
				],
			};

			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/billing-history' )
					.reply( 200, successResponse );
			} );

			test( 'should dispatch fetch action when thunk triggered', () => {
				requestBillingTransactions()( spy );

				expect( spy ).to.have.been.calledWith( {
					type: BILLING_TRANSACTIONS_REQUEST,
				} );
			} );

			test( 'should dispatch receive action when request completes', () => {
				return requestBillingTransactions()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: BILLING_TRANSACTIONS_RECEIVE,
						past: successResponse.billing_history,
						upcoming: successResponse.upcoming_charges,
					} );
				} );
			} );

			test( 'should dispatch request success action when request completes', () => {
				return requestBillingTransactions()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: BILLING_TRANSACTIONS_REQUEST_SUCCESS,
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			const message =
				'An active access token must be used to query information about the current user.';

			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/billing-history' )
					.reply( 403, {
						error: 'authorization_required',
						message,
					} );
			} );

			test( 'should dispatch request failure action when request fails', () => {
				return requestBillingTransactions( 87654321 )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: BILLING_TRANSACTIONS_REQUEST_FAILURE,
						error: sinon.match( {
							message,
						} ),
					} );
				} );
			} );
		} );
	} );

	describe( '#sendBillingReceiptEmail()', () => {
		const receiptId = 12345678;

		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/billing-history/receipt/' + receiptId + '/email' )
					.reply( 200, { success: true } );
			} );

			test( 'should dispatch send action when thunk triggered', () => {
				sendBillingReceiptEmail( receiptId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: BILLING_RECEIPT_EMAIL_SEND,
					receiptId,
				} );
			} );

			test( 'should dispatch send success action when request completes', () => {
				return sendBillingReceiptEmail( receiptId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
						receiptId,
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			const message =
				'An active access token must be used to query information about the current user.';

			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/billing-history/receipt/' + receiptId + '/email' )
					.reply( 403, {
						error: 'authorization_required',
						message,
					} );
			} );

			test( 'should dispatch send failure action when request fails', () => {
				return sendBillingReceiptEmail( receiptId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: BILLING_RECEIPT_EMAIL_SEND_FAILURE,
						receiptId,
						error: sinon.match( {
							message,
						} ),
					} );
				} );
			} );
		} );
	} );

	describe( '#requestBillingTransaction', () => {
		const receiptId = 12345678;

		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/billing-history/receipt/' + receiptId + '?format=display' )
					.reply( 200, { data: 'receipt' } );
			} );

			test( 'should dispatch request action', () => {
				requestBillingTransaction( receiptId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: BILLING_RECEIPT_REQUEST,
					receiptId,
				} );
			} );

			test( 'should dispatch success action', () => {
				return requestBillingTransaction( receiptId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: BILLING_RECEIPT_REQUEST_SUCCESS,
						receiptId,
						receipt: { data: 'receipt' },
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/billing-history/receipt/' + receiptId + '?format=display' )
					.reply( 403, {
						error: 'authorization_required',
					} );
			} );

			test( 'should dispatch failure action', () => {
				return requestBillingTransaction( receiptId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: BILLING_RECEIPT_REQUEST_FAILURE,
						receiptId,
					} );
				} );
			} );
		} );
	} );
} );
