/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { apiSuccess, apiFailure } from '../utils';
import {
	WOOCOMMERCE_WC_API_SUCCESS,
	WOOCOMMERCE_WC_API_UNAVAILABLE,
	WOOCOMMERCE_WC_API_UNKNOWN_ERROR,
} from '../../action-types';

describe( 'utils', () => {
	const action = { type: '%%initiating_action%%' };

	describe( '#apiSuccess', () => {
		test( 'should call onSuccess', () => {
			const dispatch = jest.fn();
			const responseSuccess = { data: { status: 200, body: 'response' } };
			const onSuccess = jest.fn();
			const onFailure = jest.fn();

			const handler = apiSuccess( onSuccess, onFailure );
			handler( action, responseSuccess )( dispatch );

			expect( onSuccess ).toHaveBeenCalledTimes( 1 );
			expect( onFailure ).not.toHaveBeenCalled();
			expect( onSuccess ).toHaveBeenCalledWith( { dispatch }, action, responseSuccess );
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( { type: WOOCOMMERCE_WC_API_SUCCESS } )
			);
		} );

		test( 'should call onFailure for 404', () => {
			const dispatch = jest.fn();
			const responseError = { data: { status: 404, body: { code: 'code', message: 'response' } } };
			const onSuccess = jest.fn();
			const onFailure = jest.fn();

			const handler = apiSuccess( onSuccess, onFailure );
			handler( action, responseError )( dispatch );

			expect( onSuccess ).not.toHaveBeenCalled();
			expect( onFailure ).toHaveBeenCalled();
			expect( onFailure ).toHaveBeenCalledWith( { dispatch }, action, responseError );
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( { type: WOOCOMMERCE_WC_API_UNAVAILABLE } )
			);
		} );

		test( 'should call onFailure for other error code', () => {
			const dispatch = jest.fn();
			const responseError = { data: { status: 500, body: { code: 'code', message: 'response' } } };
			const onSuccess = jest.fn();
			const onFailure = jest.fn();

			const handler = apiSuccess( onSuccess, onFailure );
			handler( action, responseError )( dispatch );

			expect( onSuccess ).not.toHaveBeenCalled();
			expect( onFailure ).toHaveBeenCalled();
			expect( onFailure ).toHaveBeenCalledWith( { dispatch }, action, responseError );
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( { type: WOOCOMMERCE_WC_API_UNKNOWN_ERROR } )
			);
		} );
	} );

	describe( '#apiFailure', () => {
		test( 'should call onFailure', () => {
			const dispatch = jest.fn();
			const error = { message: 'response' };
			const onFailure = jest.fn();

			const handler = apiFailure( onFailure );
			handler( action, error )( dispatch );

			expect( onFailure ).toHaveBeenCalledTimes( 1 );
			expect( onFailure ).toHaveBeenCalledWith( { dispatch }, action, error );
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( { type: WOOCOMMERCE_WC_API_UNKNOWN_ERROR } )
			);
		} );
	} );
} );
