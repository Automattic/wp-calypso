/** @format */

/**
 * Internal dependencies
 */
import { TRANSACTION_CREATE_REQUEST, TRANSACTION_CREATE_SUCCESS, TRANSACTION_CREATE_FAILURE } from 'state/action-types';
import { createTransaction, setCreateTransactionResponse, setCreateTransactionError } from '../actions';

describe( '/state/transactions/actions', () => {
	const request = { arbitrary: 'request' };

	describe( 'createTransaction()', () => {
		test( 'should create request action.', () => {
			expect( createTransaction( request ) ).toEqual( {
				type: TRANSACTION_CREATE_REQUEST,
				request,
			} );
		} );
	} );

	describe( 'setCreateTransactionResponse()', () => {
		const response = { arbitrary: 'response' };

		test( 'should create success action', () => {
			expect( setCreateTransactionResponse( null, response ) ).toEqual( {
				type: TRANSACTION_CREATE_SUCCESS,
				response
			} );
		} );
	} );

	describe( 'setOrderTransactionError()', () => {
		const error = Error('Error!');

		test( 'should create failure action', () => {
			expect( setCreateTransactionError( null, error ) ).toEqual( {
				type: TRANSACTION_CREATE_FAILURE,
				error
			} );
		} );
	} );
} );
