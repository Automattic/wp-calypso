import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import { get } from 'lodash';
import {
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { getTwoFactorAuthNonce, getTwoFactorUserId } from 'calypso/state/login/selectors';
import {
	getErrorFromHTTPError,
	getSMSMessageFromResponse,
	postLoginRequest,
} from 'calypso/state/login/utils';

import 'calypso/state/login/init';

/**
 * Sends a two factor authentication recovery code to a user.
 * @param {string} flow (Optional) OAuth2 client's flow name
 * @returns {Function} A thunk that can be dispatched
 */
export const sendSmsCode = ( flow ) => ( dispatch, getState ) => {
	dispatch( {
		type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
		notice: {
			message: translate( 'Sending you a text message…' ),
		},
	} );

	return postLoginRequest( 'send-sms-code-endpoint', {
		user_id: getTwoFactorUserId( getState() ),
		two_step_nonce: getTwoFactorAuthNonce( getState(), 'sms' ),
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
		...( flow ? { flow } : {} ),
	} )
		.then( ( response ) => {
			const message = getSMSMessageFromResponse( response );

			dispatch( {
				type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
				notice: {
					message,
					status: 'is-success',
				},
				twoStepNonce: get( response, 'body.data.two_step_nonce' ),
			} );
		} )
		.catch( ( httpError ) => {
			const error = getErrorFromHTTPError( httpError );

			dispatch( {
				type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
				error,
				twoStepNonce: get( httpError, 'response.body.data.two_step_nonce' ),
			} );
		} );
};
