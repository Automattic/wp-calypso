/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';
import { useSandbox } from 'test/helpers/use-sinon';
import useNock from 'test/helpers/use-nock';

/**
 * Internal dependencies
 */
import {
	BILLING_TRANSACTIONS_RECEIVE,
	BILLING_TRANSACTIONS_REQUEST,
	BILLING_TRANSACTIONS_REQUEST_SUCCESS,
	BILLING_TRANSACTIONS_REQUEST_FAILURE
} from 'state/action-types';
import { requestBillingTransactions } from '../actions';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	describe( '#requestBillingTransactions()', () => {
		describe( 'success', () => {
			const successResponse = {
				billing_history: [
					{
						id: '12345678',
						amount: '$1.23',
						date: '2016-12-12T11:22:33+0000'
					}
				],
				upcoming_charges: [
					{
						id: '87654321',
						amount: '$4.56',
						date: '2016-12-12T11:22:33+0000'
					}
				]
			};

			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/billing-history' )
					.reply( 200, successResponse );
			} );

			it( 'should dispatch fetch action when thunk triggered', () => {
				requestBillingTransactions()( spy );

				expect( spy ).to.have.been.calledWith( {
					type: BILLING_TRANSACTIONS_REQUEST,
				} );
			} );

			it( 'should dispatch receive action when request completes', () => {
				return requestBillingTransactions()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: BILLING_TRANSACTIONS_RECEIVE,
						past: successResponse.billing_history,
						upcoming: successResponse.upcoming_charges
					} );
				} );
			} );

			it( 'should dispatch request success action when request completes', () => {
				return requestBillingTransactions()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: BILLING_TRANSACTIONS_REQUEST_SUCCESS,
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			const message = 'An active access token must be used to query information about the current user.';

			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/me/billing-history' )
					.reply( 403, {
						error: 'authorization_required',
						message
					} );
			} );

			it( 'should dispatch request failure action when request fails', () => {
				return requestBillingTransactions( 87654321 )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: BILLING_TRANSACTIONS_REQUEST_FAILURE,
						error: sinon.match( {
							message
						} )
					} );
				} );
			} );
		} );
	} );
} );
