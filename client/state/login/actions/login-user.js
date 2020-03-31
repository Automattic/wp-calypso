/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	LOGIN_REQUEST,
	LOGIN_REQUEST_FAILURE,
	LOGIN_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
} from 'state/action-types';
import { remoteLoginUser } from 'state/login/actions/remote-login-user';
import {
	getErrorFromHTTPError,
	getSMSMessageFromResponse,
	postLoginRequest,
} from 'state/login/utils';

import 'state/login/init';

/**
 * Logs a user in.
 *
 * @param  {string}   usernameOrEmail Username or email of the user
 * @param  {string}   password        Password of the user
 * @param  {string}   redirectTo      Url to redirect the user to upon successful login
 * @param  {string}   domain          A domain to reverse login to
 * @returns {Function}                 A thunk that can be dispatched
 */
export const loginUser = ( usernameOrEmail, password, redirectTo, domain ) => dispatch => {
	dispatch( {
		type: LOGIN_REQUEST,
	} );

	return postLoginRequest( 'login-endpoint', {
		username: usernameOrEmail,
		password,
		remember_me: true,
		redirect_to: redirectTo,
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
		domain: domain,
	} )
		.then( response => {
			if ( get( response, 'body.data.two_step_notification_sent' ) === 'sms' ) {
				dispatch( {
					type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
					notice: {
						message: getSMSMessageFromResponse( response ),
						status: 'is-success',
					},
					twoStepNonce: get( response, 'body.data.two_step_nonce_sms' ),
				} );
			}

			// if the user has 2FA, in this stage he's not yet logged in.
			if ( ! get( response, 'body.data.two_step_notification_sent' ) ) {
				return remoteLoginUser( get( response, 'body.data.token_links', [] ) ).then( () => {
					dispatch( {
						type: LOGIN_REQUEST_SUCCESS,
						data: response.body && response.body.data,
					} );
				} );
			}

			return dispatch( {
				type: LOGIN_REQUEST_SUCCESS,
				data: response.body && response.body.data,
			} );
		} )
		.catch( httpError => {
			const error = getErrorFromHTTPError( httpError );

			dispatch( {
				type: LOGIN_REQUEST_FAILURE,
				error,
			} );

			return Promise.reject( error );
		} );
};
