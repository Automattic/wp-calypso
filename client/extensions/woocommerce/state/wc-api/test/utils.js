/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

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
			const store = {
				dispatch: spy(),
			};
			const responseSuccess = { data: { status: 200, body: 'response' } };
			const onSuccess = spy();
			const onFailure = spy();

			const handler = apiSuccess( onSuccess, onFailure );
			handler( store, action, responseSuccess );

			expect( onSuccess ).to.have.been.calledOnce;
			expect( onFailure ).to.not.have.been.called;
			expect( onSuccess ).to.have.been.calledWith( store, action, responseSuccess );
			expect( store.dispatch ).to.have.been.calledWith(
				match( { type: WOOCOMMERCE_WC_API_SUCCESS } )
			);
		} );

		test( 'should call onFailure for 404', () => {
			const store = {
				dispatch: spy(),
			};
			const responseError = { data: { status: 404, body: { code: 'code', message: 'response' } } };
			const onSuccess = spy();
			const onFailure = spy();

			const handler = apiSuccess( onSuccess, onFailure );
			handler( store, action, responseError );

			expect( onSuccess ).to.not.have.been.called;
			expect( onFailure ).to.have.been.called;
			expect( onFailure ).to.have.been.calledWith( store, action, responseError );
			expect( store.dispatch ).to.have.been.calledWith(
				match( { type: WOOCOMMERCE_WC_API_UNAVAILABLE } )
			);
		} );

		test( 'should call onFailure for other error code', () => {
			const store = {
				dispatch: spy(),
			};
			const responseError = { data: { status: 500, body: { code: 'code', message: 'response' } } };
			const onSuccess = spy();
			const onFailure = spy();

			const handler = apiSuccess( onSuccess, onFailure );
			handler( store, action, responseError );

			expect( onSuccess ).to.not.have.been.called;
			expect( onFailure ).to.have.been.called;
			expect( onFailure ).to.have.been.calledWith( store, action, responseError );
			expect( store.dispatch ).to.have.been.calledWith(
				match( { type: WOOCOMMERCE_WC_API_UNKNOWN_ERROR } )
			);
		} );
	} );

	describe( '#apiFailure', () => {
		test( 'should call onFailure', () => {
			const store = {
				dispatch: spy(),
			};
			const error = { message: 'response' };
			const onFailure = spy();

			const handler = apiFailure( onFailure );
			handler( store, action, error );

			expect( onFailure ).to.have.been.calledOnce;
			expect( onFailure ).to.have.been.calledWith( store, action, error );
			expect( store.dispatch ).to.have.been.calledWith(
				match( { type: WOOCOMMERCE_WC_API_UNKNOWN_ERROR } )
			);
		} );
	} );
} );
