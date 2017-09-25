/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { requestReset, handleError, handleSuccess } from '../';
import { setResetMethod } from 'state/account-recovery/reset/actions';
import { ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS, ACCOUNT_RECOVERY_RESET_REQUEST_ERROR } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'account-recovery/request-reset', () => {
	describe( '#requestReset', () => {
		it( 'should dispatch HTTP request to account recovery request reset endpoint', () => {
			const dispatchSpy = spy();
			const dummyAction = {
				userData: {
					user: 'foo',
				},
				method: 'primary_email',
			};

			requestReset( { dispatch: dispatchSpy }, dummyAction );

			const {
				userData,
				method,
			} = dummyAction;
			expect( dispatchSpy ).to.have.been.calledOnce;
			expect( dispatchSpy ).to.have.been.calledWith( http( {
				method: 'POST',
				apiNamespace: 'wpcom/v2',
				path: '/account-recovery/request-reset',
				body: {
					...userData,
					method,
				},
			}, dummyAction ) );
		} );
	} );

	describe( '#handleError', () => {
		it( 'should dispatch failure action with error message', () => {
			const dispatchSpy = spy();
			const message = 'This is an error message.';
			const rawError = Error( message );

			handleError( { dispatch: dispatchSpy }, null, rawError );

			expect( dispatchSpy ).to.have.been.calledOnce;
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
				error: message,
			} );
		} );
	} );

	describe( '#handleSuccess', () => {
		it( 'should dispatch success action and set reset method action', () => {
			const dispatchSpy = spy();
			const dummyAction = {
				userData: {
					user: 'foo',
				},
				method: 'primary_email',
			};
			const { method } = dummyAction;

			handleSuccess( { dispatch: dispatchSpy }, dummyAction );

			expect( dispatchSpy ).to.have.been.calledTwice;
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
			} );
			expect( dispatchSpy ).to.have.been.calledWith( setResetMethod( method ) );
		} );
	} );
} );
