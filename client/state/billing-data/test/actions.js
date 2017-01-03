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
	BILLING_DATA_RECEIVE,
	BILLING_DATA_REQUEST,
	BILLING_DATA_REQUEST_SUCCESS,
	BILLING_DATA_REQUEST_FAILURE
} from 'state/action-types';
import { requestBillingData } from '../actions';
import { parseDate } from '../util';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	describe( '#requestBillingData()', () => {
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
				requestBillingData()( spy );

				expect( spy ).to.have.been.calledWith( {
					type: BILLING_DATA_REQUEST,
				} );
			} );

			it( 'should dispatch receive action when request completes', () => {
				return requestBillingData()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: BILLING_DATA_RECEIVE,
						past: successResponse.billing_history.map( parseDate ),
						upcoming: successResponse.upcoming_charges.map( parseDate )
					} );
				} );
			} );

			it( 'should dispatch request success action when request completes', () => {
				return requestBillingData()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: BILLING_DATA_REQUEST_SUCCESS,
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
				return requestBillingData( 87654321 )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: BILLING_DATA_REQUEST_FAILURE,
						error: sinon.match( {
							message
						} )
					} );
				} );
			} );
		} );
	} );
} );
