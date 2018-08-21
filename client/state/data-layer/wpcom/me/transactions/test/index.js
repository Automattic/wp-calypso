/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { createTransaction, createSuccess, createError } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { TRANSACTION_CREATE_REQUEST, TRANSACTION_CREATE_SUCCESS, TRANSACTION_CREATE_FAILURE } from 'state/action-types';

describe( 'data-layer/me/transactions', () => {
	describe( '#createTransaction', () => {
		const action = { type: TRANSACTION_CREATE_REQUEST };

		test( 'should create HTTP request to /me/transactions endpoint', () => {
			expect( createTransaction( action ) ).to.deep.equal(
				http(
					{
						path: '/me/transactions',
						method: 'POST',
						apiNamespace: 'rest/v1',
						query: Object.assign( {}, {	http_envelope: 1 }, action ),
					},
					action
				)
			);
		} );
	} );

	describe( '#onError', () => {
		const message = 'This is an error message.';

		test( 'should create failure action', () => {
			expect( createError( null, Error( message ) ) ).to.deep.equal( {
				type: TRANSACTION_CREATE_FAILURE,
				message
			} );
		} );
	} );

	describe( '#onSuccess', () => {
		test( 'should create success action with response', () => {
			const response = { arbitrary: 'response' };
			expect( createSuccess( null, response ) ).to.deep.equal( {
				type: TRANSACTION_CREATE_SUCCESS,
				...response
			} );
		} );
	} );
} );
