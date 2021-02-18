/**
 * Internal dependencies
 */
import { requestEmailVerification, handleSuccess, handleError } from '../';
import {
	EMAIL_VERIFY_REQUEST_SUCCESS,
	EMAIL_VERIFY_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	infoNotice,
	errorNotice,
	successNotice,
	removeNotice,
} from 'calypso/state/notices/actions';
import { translate } from 'i18n-calypso';

describe( 'send-email-verification', () => {
	describe( '#requestEmailVerification', () => {
		test( 'should dispatch HTTP request to me/send-verification-email endpoint', () => {
			expect( requestEmailVerification( { type: 'DUMMY' } ) ).toContainEqual(
				expect.objectContaining(
					http(
						{
							apiVersion: '1.1',
							method: 'POST',
							path: '/me/send-verification-email',
						},
						{ type: 'DUMMY' }
					)
				)
			);
		} );

		test( 'should dispatch info notice when showing global notices', () => {
			expect(
				requestEmailVerification( { type: 'DUMMY', showGlobalNotices: true } )
			).toContainEqual(
				infoNotice( translate( 'Sending email…' ), {
					id: 'email-verification-info-notice',
					duration: 4000,
				} )
			);
		} );
	} );

	describe( '#handleError', () => {
		const message = 'This is an error message.';
		const rawError = Error( message );

		test( 'should dispatch failure action with error message', () => {
			expect( handleError( null, rawError ) ).toContainEqual( {
				type: EMAIL_VERIFY_REQUEST_FAILURE,
				message,
			} );
		} );

		test( 'should dispatch error notice when showing global notices', () => {
			expect( handleError( { showGlobalNotices: true }, rawError ) ).toContainEqual(
				errorNotice( translate( 'Sorry, we couldn’t send the email.' ), {
					id: 'email-verification-error-notice',
					duration: 4000,
				} )
			);
		} );

		test( 'should remove info notice when showing global notices', () => {
			expect( handleError( { showGlobalNotices: true }, rawError ) ).toContainEqual(
				removeNotice( 'email-verification-info-notice' )
			);
		} );
	} );

	describe( '#handleSuccess', () => {
		test( 'should dispatch failure action with error message', () => {
			expect( handleSuccess() ).toContainEqual( {
				type: EMAIL_VERIFY_REQUEST_SUCCESS,
			} );
		} );

		test( 'should dispatch success notice when showing global notices', () => {
			expect( handleSuccess( { showGlobalNotices: true } ) ).toContainEqual(
				successNotice( translate( 'Email sent' ), {
					id: 'email-verification-success-notice',
					duration: 4000,
				} )
			);
		} );

		test( 'should remove info notice when showing global notices', () => {
			expect( handleSuccess( { showGlobalNotices: true } ) ).toContainEqual(
				removeNotice( 'email-verification-info-notice' )
			);
		} );
	} );
} );
