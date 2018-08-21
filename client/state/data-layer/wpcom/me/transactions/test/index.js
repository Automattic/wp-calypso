/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { createTransaction, createSuccess, createError } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { TRANSACTION_CREATE_REQUEST, TRANSACTION_CREATE_SUCCESS, TRANSACTION_CREATE_FAILURE } from 'state/action-types';

describe( 'data-layer/me/transactions', () => {
	describe( '#createTransaction', () => {
		const action = { type: TRANSACTION_CREATE_REQUEST, request: { arbitrary: 'request' } };

		test( 'should create HTTP request to /me/transactions endpoint', () => {
			expect( createTransaction( action ) ).toEqual(
				http(
					{
						path: '/me/transactions',
						method: 'POST',
						apiNamespace: 'rest/v1',
						query: Object.assign( {}, { http_envelope: 1 }, action.request ),
					},
					action
				)
			);
		} );
	} );
} );
