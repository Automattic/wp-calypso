/**
 * External dependencies
 */
import { get, replace } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS,
} from 'state/action-types';
import { getTwoFactorAuthNonce, getTwoFactorUserId } from 'state/login/selectors';
import { getErrorFromHTTPError, postLoginRequest } from 'state/login/utils';

import { remoteLoginUser } from 'state/login/actions/remote-login-user';
import { updateNonce } from 'state/login/actions/update-nonce';

import 'state/login/init';

/**
 * Logs a user in with a two factor verification code.
 *
 * @param  {string}   twoStepCode       Verification code received by the user
 * @param  {string}   twoFactorAuthType Two factor authentication method (sms, push ...)
 * @returns {Function}                   A thunk that can be dispatched
 */
export const loginUserWithTwoFactorVerificationCode = ( twoStepCode, twoFactorAuthType ) => (
	dispatch,
	getState
) => {
	dispatch( { type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST } );

	return postLoginRequest( 'two-step-authentication-endpoint', {
		user_id: getTwoFactorUserId( getState() ),
		auth_type: twoFactorAuthType,
		two_step_code: replace( twoStepCode, /\s/g, '' ),
		two_step_nonce: getTwoFactorAuthNonce( getState(), twoFactorAuthType ),
		remember_me: true,
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
	} )
		.then( response => {
			return remoteLoginUser( get( response, 'body.data.token_links', [] ) ).then( () => {
				dispatch( { type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS } );
			} );
		} )
		.catch( httpError => {
			const twoStepNonce = get( httpError, 'response.body.data.two_step_nonce' );

			if ( twoStepNonce ) {
				dispatch( updateNonce( twoFactorAuthType, twoStepNonce ) );
			}

			const error = getErrorFromHTTPError( httpError );

			dispatch( {
				type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
				error,
			} );

			return Promise.reject( error );
		} );
};
