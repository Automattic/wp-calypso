/** @format */
/**
 * Internal dependencies
 */
import { requestBillingTransaction, clearBillingTransactionError } from '../actions';
import {
	BILLING_TRANSACTION_REQUEST,
	BILLING_TRANSACTION_REQUEST_FAILURE,
	BILLING_TRANSACTION_REQUEST_SUCCESS,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	describe( '#requestBillingTransaction', () => {
		const transactionId = 12345678;

		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/billing-history/receipt/' + transactionId + '?format=display' )
					.reply( 200, { data: 'receipt' } );
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
						receipt: { data: 'receipt' },
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( nock => {
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
		const receiptId = 12345678;
		const action = clearBillingTransactionError( receiptId );
		expect( action ).toEqual( {
			type: BILLING_TRANSACTION_REQUEST_FAILURE,
			receiptId,
			error: false,
		} );
	} );
} );
