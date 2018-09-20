/** @format */
/**
 * Internal dependencies
 */
import { fetch, onError, onSuccess } from '../';
import {
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
} from 'state/action-types';

import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'account-recovery/reset', () => {
	describe( '#handleResetPasswordRequest', () => {
		test( 'should dispatch HTTP request to account recovery reset endpoint', () => {
			const dummyAction = {
				userData: {
					user: 'foo',
				},
				method: 'primary_email',
				key: 'a-super-secret-key',
				password: 'my-new-password-which-I-cannot-remember',
			};

			const { userData, method, key, password } = dummyAction;
			expect( fetch( dummyAction ) ).toEqual(
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
		test( 'should dispatch failure action with error message', () => {
			const message = 'This is an error message.';
			const rawError = Error( message );

			expect( onError( null, rawError ) ).toEqual( {
				type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
				error: message,
			} );
		} );
	} );

	describe( '#requestResetPasswordSuccess', () => {
		test( 'should dispatch success action', () => {
			expect( onSuccess() ).toEqual( {
				type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
			} );
		} );
	} );
} );
