/**
 * External dependencies
 */
import { get, defer } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	LOGIN_AUTH_ACCOUNT_TYPE_REQUEST,
	LOGIN_AUTH_ACCOUNT_TYPE_REQUESTING,
	LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE,
	LOGIN_AUTH_ACCOUNT_TYPE_RESET,
	LOGIN_FORM_UPDATE,
	SOCIAL_LOGIN_REQUEST,
	SOCIAL_LOGIN_REQUEST_FAILURE,
	SOCIAL_LOGIN_REQUEST_SUCCESS,
	SOCIAL_CREATE_ACCOUNT_REQUEST,
	SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS,
	SOCIAL_CONNECT_ACCOUNT_REQUEST,
	SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS,
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST,
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST_FAILURE,
	SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
} from 'state/action-types';
import { getTwoFactorAuthNonce, getTwoFactorUserId } from 'state/login/selectors';
import {
	getErrorFromHTTPError,
	getErrorFromWPCOMError,
	getSMSMessageFromResponse,
	postLoginRequest,
} from 'state/login/utils';
import wpcom from 'lib/wp';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import 'state/data-layer/wpcom/login-2fa';
import 'state/data-layer/wpcom/users/auth-options';

import { remoteLoginUser } from 'state/login/actions/remote-login-user';

import 'state/login/init';

export { loginUser } from 'state/login/actions/login-user';
export { updateNonce } from 'state/login/actions/login-user';
export { loginUserWithSecurityKey } from 'state/login/actions/login-user-with-security-key';
export { loginUserWithTwoFactorVerificationCode } from 'state/login/actions/login-user-with-two-factor-verification-code';

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
export const loginSocialUser = ( socialInfo, redirectTo ) => dispatch => {
	dispatch( { type: SOCIAL_LOGIN_REQUEST } );

	return postLoginRequest( 'social-login-endpoint', {
		...socialInfo,
		redirect_to: redirectTo,
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
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

			return remoteLoginUser( get( response, 'body.data.token_links', [] ) ).then( () => {
				dispatch( {
					type: SOCIAL_LOGIN_REQUEST_SUCCESS,
					data: get( response, 'body.data' ),
				} );
			} );
		} )
		.catch( httpError => {
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

/**
 * Creates a WordPress.com account from a third-party social account (Google ...).
 *
 * @param  {object}   socialInfo     Object containing { service, access_token, id_token }
 *           {string}   service      The external social service name
 *           {string}   access_token OAuth2 access token provided by the social service
 *           {string}   id_token     JWT ID token such as the one provided by Google OpenID Connect
 * @param  {string}   flowName       The name of the current signup flow
 * @returns {Function}                A thunk that can be dispatched
 */
export const createSocialUser = ( socialInfo, flowName ) => dispatch => {
	dispatch( {
		type: SOCIAL_CREATE_ACCOUNT_REQUEST,
		notice: {
			message: translate( 'Creating your account' ),
		},
	} );

	return wpcom
		.undocumented()
		.usersSocialNew( { ...socialInfo, signup_flow_name: flowName } )
		.then(
			wpcomResponse => {
				const data = {
					username: wpcomResponse.username,
					bearerToken: wpcomResponse.bearer_token,
				};
				dispatch( { type: SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS, data } );
				return data;
			},
			wpcomError => {
				const error = getErrorFromWPCOMError( wpcomError );

				dispatch( {
					type: SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
					error,
				} );

				return Promise.reject( error );
			}
		);
};

/**
 * Connects the current WordPress.com account with a third-party social account (Google ...).
 *
 * @param  {object}   socialInfo     Object containing { service, access_token, id_token, redirectTo }
 *           {string}   service      The external social service name
 *           {string}   access_token OAuth2 access token provided by the social service
 *           {string}   id_token     JWT ID token such as the one provided by Google OpenID Connect
 * @param  {string}   redirectTo     Url to redirect the user to upon successful login
 * @returns {Function}                A thunk that can be dispatched
 */
export const connectSocialUser = ( socialInfo, redirectTo ) => dispatch => {
	dispatch( {
		type: SOCIAL_CONNECT_ACCOUNT_REQUEST,
		notice: {
			message: translate( 'Creating your account' ),
		},
	} );

	return wpcom
		.undocumented()
		.me()
		.socialConnect( { ...socialInfo, redirect_to: redirectTo } )
		.then(
			wpcomResponse => {
				dispatch( {
					type: SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS,
					redirect_to: wpcomResponse.redirect_to,
				} );
			},
			wpcomError => {
				const error = getErrorFromWPCOMError( wpcomError );

				dispatch( {
					type: SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE,
					error,
				} );

				return Promise.reject( error );
			}
		);
};

/**
 * Disconnects the current WordPress.com account from a third-party social account (Google ...).
 *
 * @param  {string}   socialService The social service name
 * @returns {Function}               A thunk that can be dispatched
 */
export const disconnectSocialUser = socialService => dispatch => {
	dispatch( {
		type: SOCIAL_DISCONNECT_ACCOUNT_REQUEST,
		notice: {
			message: translate( 'Creating your account' ),
		},
	} );

	return wpcom
		.undocumented()
		.me()
		.socialDisconnect( socialService )
		.then(
			() => {
				dispatch( {
					type: SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS,
				} );
			},
			wpcomError => {
				const error = getErrorFromWPCOMError( wpcomError );

				dispatch( {
					type: SOCIAL_DISCONNECT_ACCOUNT_REQUEST_FAILURE,
					error,
				} );

				return Promise.reject( error );
			}
		);
};

export const createSocialUserFailed = ( socialInfo, error ) => ( {
	type: SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
	authInfo: socialInfo,
	error: error.field ? error : getErrorFromWPCOMError( error ),
} );

/**
 * Sends a two factor authentication recovery code to a user.
 *
 * @returns {Function} A thunk that can be dispatched
 */
export const sendSmsCode = () => ( dispatch, getState ) => {
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
	} )
		.then( response => {
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
		.catch( httpError => {
			const error = getErrorFromHTTPError( httpError );

			dispatch( {
				type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
				error,
				twoStepNonce: get( httpError, 'response.body.data.two_step_nonce' ),
			} );
		} );
};

export const startPollAppPushAuth = () => ( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START } );
export const stopPollAppPushAuth = () => ( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP } );
export const formUpdate = () => ( { type: LOGIN_FORM_UPDATE } );

/**
 * Retrieves the type of authentication of the account (regular, passwordless ...) of the specified user.
 *
 * @param  {string}   usernameOrEmail Identifier of the user
 * @returns {Function}                 A thunk that can be dispatched
 */
export const getAuthAccountType = usernameOrEmail => dispatch => {
	dispatch( recordTracksEvent( 'calypso_login_block_login_form_get_auth_type' ) );

	dispatch( {
		type: LOGIN_AUTH_ACCOUNT_TYPE_REQUEST,
		usernameOrEmail,
	} );

	if ( usernameOrEmail === '' ) {
		const error = {
			code: 'empty_username',
			message: translate( 'Please enter a username or email address.' ),
			field: 'usernameOrEmail',
		};

		dispatch(
			recordTracksEvent( 'calypso_login_block_login_form_get_auth_type_failure', {
				error_code: error.code,
				error_message: error.message,
			} )
		);

		defer( () => {
			dispatch( {
				type: LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE,
				error,
			} );
		} );

		return;
	}

	dispatch( {
		type: LOGIN_AUTH_ACCOUNT_TYPE_REQUESTING,
		usernameOrEmail,
	} );
};

/**
 * Resets the type of authentication of the account of the current user.
 *
 * @returns {object} An action that can be dispatched
 */
export const resetAuthAccountType = () => ( {
	type: LOGIN_AUTH_ACCOUNT_TYPE_RESET,
} );

/**
 * Creates an action that indicates that the push poll is completed
 *
 * @param {Array<string>} tokenLinks token links array
 * @returns {Function} a thunk
 */
export const receivedTwoFactorPushNotificationApproved = tokenLinks => dispatch => {
	if ( ! Array.isArray( tokenLinks ) ) {
		return dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED } );
	}

	remoteLoginUser( tokenLinks ).then( () =>
		dispatch( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED } )
	);
};
