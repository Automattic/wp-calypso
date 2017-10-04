/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */

import { resetPassword, handleError, handleSuccess } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';

import {
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
} from 'state/action-types';

describe( 'account-recovery/reset', () => {
	describe( '#handleResetPasswordRequest', () => {
		it( 'should dispatch HTTP request to account recovery reset endpoint', () => {
			const dispatchSpy = spy();
			const dummyAction = {
				userData: {
					user: 'foo',
				},
				method: 'primary_email',
				key: 'a-super-secret-key',
				password: 'my-new-password-which-I-cannot-remember',
			};

			resetPassword( { dispatch: dispatchSpy }, dummyAction );

			const { userData, method, key, password } = dummyAction;
			expect( dispatchSpy ).to.have.been.calledOnce;
			expect( dispatchSpy ).to.have.been.calledWith(
				http(
					{
						method: 'POST',
						apiNamespace: 'wpcom/v2',
						path: '/account-recovery/reset',
						body: {
							...userData,
							method,
							key,
							password,
						},
					},
					dummyAction
				)
			);
		} );
	} );

	describe( '#requestResetPasswordError', () => {
		it( 'should dispatch failure action with error message', () => {
			const dispatchSpy = spy();
			const message = 'This is an error message.';
			const rawError = Error( message );

			handleError( { dispatch: dispatchSpy }, null, rawError );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
				error: message,
			} );
		} );
	} );

	describe( '#requestResetPasswordSuccess', () => {
		it( 'should dispatch success action', () => {
			const dispatchSpy = spy();

			handleSuccess( { dispatch: dispatchSpy } );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
			} );
		} );
	} );
} );
