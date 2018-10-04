/** @format */
/**
 * Internal dependencies
 */
import { fetch, onError, onSuccess } from '../';
import { setResetMethod } from 'state/account-recovery/reset/actions';
import {
	ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'account-recovery/request-reset', () => {
	describe( '#requestReset', () => {
		test( 'should dispatch HTTP request to account recovery request reset endpoint', () => {
			const dummyAction = {
				userData: {
					user: 'foo',
				},
				method: 'primary_email',
			};

			expect( fetch( dummyAction ) ).toEqual(
				http(
					{
						method: 'POST',
						apiNamespace: 'wpcom/v2',
						path: '/account-recovery/request-reset',
						body: {
							...dummyAction.userData,
							method: dummyAction.method,
						},
					},
					dummyAction
				)
			);
		} );
	} );

	describe( '#handleError', () => {
		test( 'should dispatch failure action with error message', () => {
			const message = 'This is an error message.';
			const rawError = Error( message );

			expect( onError( null, rawError ) ).toEqual( {
				type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
				error: message,
			} );
		} );
	} );

	describe( '#handleSuccess', () => {
		test( 'should dispatch success action and set reset method action', () => {
			const dummyAction = {
				userData: {
					user: 'foo',
				},
				method: 'primary_email',
			};

			expect( onSuccess( dummyAction ) ).toEqual(
				expect.arrayContaining( [
					{ type: ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS },
					setResetMethod( dummyAction.method ),
				] )
			);
		} );
	} );
} );
