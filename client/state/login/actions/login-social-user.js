/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	SOCIAL_LOGIN_REQUEST,
	SOCIAL_LOGIN_REQUEST_FAILURE,
	SOCIAL_LOGIN_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
} from 'state/action-types';
import {
	getErrorFromHTTPError,
	getSMSMessageFromResponse,
	postLoginRequest,
} from 'state/login/utils';

import { remoteLoginUser } from 'state/login/actions/remote-login-user';

import 'state/login/init';

/**
 * Logs a user in from a third-party social account (Google ...).
 *
 * @param  {object}   socialInfo     Object containing { service, access_token, id_token }
 *           {string}   service      The external social service name
 *           {string}   access_token OAuth2 access token provided by the social service
 *           {string}   id_token     JWT ID token such as the one provided by Google OpenID Connect.
 * @param  {string}   redirectTo     Url to redirect the user to upon successful login
 * @returns {Function}                A thunk that can be dispatched
 */
export const loginSocialUser = ( socialInfo, redirectTo ) => ( dispatch ) => {
	dispatch( { type: SOCIAL_LOGIN_REQUEST } );

	return postLoginRequest( 'social-login-endpoint', {
		...socialInfo,
		redirect_to: redirectTo,
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
	} )
		.then( ( response ) => {
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

			return remoteLoginUser( get( response, 'body.data.token_links', [] ) ).then( () => {
				dispatch( {
					type: SOCIAL_LOGIN_REQUEST_SUCCESS,
					data: get( response, 'body.data' ),
				} );
			} );
		} )
		.catch( ( httpError ) => {
			const error = getErrorFromHTTPError( httpError );
			error.email = get( httpError, 'response.body.data.email' );

			dispatch( {
				type: SOCIAL_LOGIN_REQUEST_FAILURE,
				error,
				authInfo: socialInfo,
				data: get( httpError, 'response.body.data' ),
			} );

			return Promise.reject( error );
		} );
};
