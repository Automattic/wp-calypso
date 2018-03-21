/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

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
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( sandbox => ( spy = sandbox.spy() ) );

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
				requestBillingTransaction( transactionId )( spy );

				expect( spy ).to.have.been.calledWith( {
					type: BILLING_TRANSACTION_REQUEST,
					transactionId,
				} );
			} );

			test( 'should dispatch success action', () => {
				return requestBillingTransaction( transactionId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
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
				return requestBillingTransaction( transactionId )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith(
						sinon.match( {
							type: BILLING_TRANSACTION_REQUEST_FAILURE,
							transactionId,
							error: sinon.match( {
								error: 'authorization_required',
							} ),
						} )
					);
				} );
			} );
		} );
	} );

	describe( '#clearBillingTransactionError', () => {
		const receiptId = 12345678;
		const action = clearBillingTransactionError( receiptId );
		expect( action ).to.deep.equal( {
			type: BILLING_TRANSACTION_REQUEST_FAILURE,
			receiptId,
			error: false,
		} );
	} );
} );
