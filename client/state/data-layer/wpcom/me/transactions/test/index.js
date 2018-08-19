/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { createTransaction, handleSuccess, handleError } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { TRANSACTION_CREATE, TRANSACTION_CREATE_SUCCESS, TRANSACTION_CREATE_FAILURE } from 'state/action-types';

describe( 'data-layer/me/transactions', () => {
	describe( '#createTransaction', () => {
		const dispatch = spy();
		const action = { type: TRANSACTION_CREATE };

		createTransaction( { dispatch }, action );

		test( 'should dispatch HTTP request to /me/transactions endpoint', () => {
			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				http(
					{
						path: `/me/transactions`,
						method: 'POST',
						apiNamespace: 'rest/v1',
						query: Object.assign( {}, {	http_envelope: 1 }, action ),
					},
					action
				)
			);
		} );
	} );

	describe( '#handleError', () => {
		const dispatch = spy();
		const message = 'This is an error message.';
		const error = Error( message );

		handleError( { dispatch }, null, error );

		test( 'should dispatch error action with error message', () => {
			expect( dispatch ).to.have.been.calledWith( {
				type: TRANSACTION_CREATE_FAILURE,
				message,
			} );
		} );
	} );

	describe( '#handleSuccess', () => {
		const dispatch = spy();

		handleSuccess( { dispatch } );

		test( 'should dispatch response action with response', () => {
			expect( dispatch ).to.have.been.calledWith( { type: TRANSACTION_CREATE_SUCCESS } );
		} );
	} );
} );
