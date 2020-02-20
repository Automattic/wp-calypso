/**
 * Internal dependencies
 */
import { requestEmailVerification, handleSuccess, handleError } from '../';
import { EMAIL_VERIFY_REQUEST_SUCCESS, EMAIL_VERIFY_REQUEST_FAILURE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'send-email-verification', () => {
	describe( '#requestEmailVerification', () => {
		const dummyAction = { type: 'DUMMY' };

		test( 'should dispatch HTTP request to me/send-verification-email endpoint', () => {
			expect( requestEmailVerification( dummyAction ) ).toEqual(
				expect.objectContaining(
					http(
						{
							apiVersion: '1.1',
							method: 'POST',
							path: '/me/send-verification-email',
						},
						dummyAction
					)
				)
			);
		} );
	} );

	describe( '#handleError', () => {
		const message = 'This is an error message.';
		const rawError = Error( message );

		test( 'should dispatch failure action with error message', () => {
			expect( handleError( null, rawError ) ).toMatchObject( {
				type: EMAIL_VERIFY_REQUEST_FAILURE,
				message,
			} );
		} );
	} );

	describe( '#handleSuccess', () => {
		test( 'should dispatch failure action with error message', () => {
			expect( handleSuccess() ).toMatchObject( {
				type: EMAIL_VERIFY_REQUEST_SUCCESS,
			} );
		} );
	} );
} );
