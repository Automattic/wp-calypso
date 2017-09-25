/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { get, omit } from 'lodash';
import React from 'react';
import request from 'superagent';

/**
 * Internal dependencies
 */
import config from 'config';
import { addLocaleToWpcomUrl, getLocaleSlug } from 'lib/i18n-utils';
import wpcom from 'lib/wp';
import { LOGIN_FORM_UPDATE, LOGIN_REQUEST, LOGIN_REQUEST_FAILURE, LOGIN_REQUEST_SUCCESS, LOGOUT_REQUEST, LOGOUT_REQUEST_FAILURE, LOGOUT_REQUEST_SUCCESS, SOCIAL_LOGIN_REQUEST, SOCIAL_LOGIN_REQUEST_FAILURE, SOCIAL_LOGIN_REQUEST_SUCCESS, SOCIAL_CREATE_ACCOUNT_REQUEST, SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE, SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS, SOCIAL_CONNECT_ACCOUNT_REQUEST, SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE, SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS, SOCIAL_DISCONNECT_ACCOUNT_REQUEST, SOCIAL_DISCONNECT_ACCOUNT_REQUEST_FAILURE, SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS, TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST, TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE, TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS, TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START, TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP, TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST, TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE, TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS, TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE } from 'state/action-types';
import { getCurrentUser } from 'state/current-user/selectors';
import { getRememberMe, getTwoFactorAuthNonce, getTwoFactorUserId } from 'state/login/selectors';

function getSMSMessageFromResponse( response ) {
	const phoneNumber = get( response, 'body.data.phone_number' );
	return translate( 'Message sent to phone number ending in %(phoneNumber)s', {
		args: {
			phoneNumber
		}
	} );
}

const errorFields = {
	empty_password: 'password',
	empty_two_step_code: 'twoStepCode',
	empty_username: 'usernameOrEmail',
	incorrect_password: 'password',
	invalid_email: 'usernameOrEmail',
	invalid_two_step_code: 'twoStepCode',
	invalid_username: 'usernameOrEmail',
};

/**
 * Retrieves the first error message from the specified HTTP error.
 *
 * @param {Object} httpError HTTP error
 * @returns {{code: string?, message: string, field: string}} an error message and the id of the corresponding field, if not global
 */
function getErrorFromHTTPError( httpError ) {
	let field = 'global';

	if ( ! httpError.status ) {
		return {
			code: 'network_error',
			message: httpError.message,
			field
		};
	}

	const code = get( httpError, 'response.body.data.errors[0].code' );

	if ( code ) {
		if ( code in errorFields ) {
			field = errorFields[ code ];
		} else if ( code === 'admin_login_attempt' ) {
			const url = addLocaleToWpcomUrl( 'https://wordpress.com/wp-login.php?action=lostpassword', getLocaleSlug() );

			return {
				code,
				message: (
					<div>
						<p>
							{ translate( 'You attempted to login with the username {{em}}admin{{/em}} on WordPress.com.',
								{ components: { em: <em /> } }
							) }
						</p>

						<p>
							{ translate( 'If you were trying to access your self hosted {{a}}WordPress.org{{/a}} site, ' +
								'try {{strong}}yourdomain.com/wp-admin/{{/strong}} instead.',
								{
									components: {
										a: <a href="http://wordpress.org" target="_blank" rel="noopener noreferrer" />,
										strong: <strong />
									}
								}
							) }
						</p>

						<p>
							{ translate( 'If you can’t remember your WordPress.com username, you can {{a}}reset your password{{/a}} ' +
								'by providing your email address.',
								{
									components: {
										a: <a href={ url } rel="external" />
									}
								}
							) }
						</p>
					</div>
				),
				field
			};
		}
	}

	let message = get( httpError, 'response.body.data.errors[0].message' );

	if ( ! message ) {
		message = get( httpError, 'response.body.data', httpError.message );
	}

	return { code, message, field };
}

/**
 * Transforms WPCOM error to the error object we use for login purposes
 *
 * @param {Object} wpcomError HTTP error
 * @returns {{message: string, field: string, code: string}} an error message and the id of the corresponding field
 */
const getErrorFromWPCOMError = ( wpcomError ) => ( {
	message: wpcomError.message,
	code: wpcomError.error,
	field: 'global',
	...omit( wpcomError, [ 'error', 'message', 'field' ] )
} );

/**
 * Attempt to login a user.
 *
 * @param  {String}    usernameOrEmail    Username or email of the user.
 * @param  {String}    password           Password of the user.
 * @param  {Boolean}   rememberMe         Whether to persist the logged in state of the user
 * @param  {String}    redirectTo         Url to redirect the user to upon successful login
 * @return {Function}                     Action thunk to trigger the login process.
 */
export const loginUser = ( usernameOrEmail, password, rememberMe, redirectTo ) => dispatch => {
	dispatch( {
		type: LOGIN_REQUEST,
	} );

	return request.post( addLocaleToWpcomUrl( 'https://wordpress.com/wp-login.php?action=login-endpoint', getLocaleSlug() ) )
		.withCredentials()
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
			username: usernameOrEmail,
			password,
			remember_me: rememberMe,
			redirect_to: redirectTo,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		} ).then( ( response ) => {
			dispatch( {
				type: LOGIN_REQUEST_SUCCESS,
				rememberMe,
				data: response.body && response.body.data,
			} );

			if ( get( response, 'body.data.two_step_notification_sent' ) === 'sms' ) {
				dispatch( {
					type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
					notice: {
						message: getSMSMessageFromResponse( response ),
						status: 'is-success'
					},
					twoStepNonce: get( response, 'body.data.two_step_nonce_sms' )
				} );
			}
		} ).catch( ( httpError ) => {
			const error = getErrorFromHTTPError( httpError );

			dispatch( {
				type: LOGIN_REQUEST_FAILURE,
				error,
			} );

			return Promise.reject( error );
		} );
};

/**
 * Attempt to login a user when a two factor verification code is sent.
 *
 * @param  {String}    twoStepCode  Verification code for the user.
 * @param {String}     twoFactorAuthType Two factor authentication method
 * @return {Function}                 Action thunk to trigger the login process.
 */
export const loginUserWithTwoFactorVerificationCode = ( twoStepCode, twoFactorAuthType ) => ( dispatch, getState ) => {
	dispatch( { type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST } );

	return request.post(
			addLocaleToWpcomUrl( 'https://wordpress.com/wp-login.php?action=two-step-authentication-endpoint', getLocaleSlug() ) )
		.withCredentials()
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
			user_id: getTwoFactorUserId( getState() ),
			auth_type: twoFactorAuthType,
			two_step_code: twoStepCode,
			two_step_nonce: getTwoFactorAuthNonce( getState(), twoFactorAuthType ),
			remember_me: getRememberMe( getState() ),
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		} )
		.then( () => {
			dispatch( { type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS } );
		} )
		.catch( ( httpError ) => {
			const twoStepNonce = get( httpError, 'response.body.data.two_step_nonce' );

			if ( twoStepNonce ) {
				dispatch( {
					type: TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE,
					twoStepNonce,
					nonceType: twoFactorAuthType,
				} );
			}

			const error = getErrorFromHTTPError( httpError );

			dispatch( {
				type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
				error,
			} );

			return Promise.reject( error );
		} );
};

/**
 * Attempt to login a user with an external social account.
 *
 * @param  {Object}    socialInfo   Object containing { service, access_token, id_token }
 *            {String}    service      The external social service name.
 *            {String}    access_token OAuth2 access token provided by the social service.
 *            {String}    id_token     JWT ID token such as the one provided by Google OpenID Connect.
 * @param  {String}    redirectTo   Url to redirect the user to upon successful login
 * @return {Function}               Action thunk to trigger the login process.
 */
export const loginSocialUser = ( socialInfo, redirectTo ) => dispatch => {
	dispatch( { type: SOCIAL_LOGIN_REQUEST } );

	return request.post( addLocaleToWpcomUrl( 'https://wordpress.com/wp-login.php?action=social-login-endpoint', getLocaleSlug() ) )
		.withCredentials()
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
			...socialInfo,
			redirect_to: redirectTo,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		} )
		.then( ( response ) => {
			dispatch( {
				type: SOCIAL_LOGIN_REQUEST_SUCCESS,
				data: get( response, 'body.data' )
			} );

			if ( get( response, 'body.data.two_step_notification_sent' ) === 'sms' ) {
				dispatch( {
					type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
					notice: {
						message: getSMSMessageFromResponse( response ),
						status: 'is-success'
					},
					twoStepNonce: get( response, 'body.data.two_step_nonce_sms' )
				} );
			}
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

/**
 * Attempt to create an account with a social service
 *
 * @param  {Object}    socialInfo   Object containing { service, access_token, id_token }
 *            {String}    service      The external social service name.
 *            {String}    access_token OAuth2 access token provided by the social service.
 *            {String}    id_token     JWT ID token such as the one provided by Google OpenID Connect.
 * @param  {String}    flowName   the name of the signup flow
 * @return {Function}             Action thunk to trigger the login process.
 */
export const createSocialUser = ( socialInfo, flowName ) => dispatch => {
	dispatch( {
		type: SOCIAL_CREATE_ACCOUNT_REQUEST,
		notice: {
			message: translate( 'Creating your account' )
		},
	} );

	return wpcom.undocumented().usersSocialNew( { ...socialInfo, signup_flow_name: flowName } ).then( wpcomResponse => {
		const data = {
			username: wpcomResponse.username,
			bearerToken: wpcomResponse.bearer_token
		};
		dispatch( { type: SOCIAL_CREATE_ACCOUNT_REQUEST_SUCCESS, data } );
		return data;
	}, wpcomError => {
		const error = getErrorFromWPCOMError( wpcomError );

		dispatch( {
			type: SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
			error,
		} );

		return Promise.reject( error );
	} );
};

/**
 * Attempt to connect the current account with a social service
 *
 * @param  {Object}    socialInfo   Object containing { service, access_token, id_token, redirectTo }
 *            {String}    service      The external social service name.
 *            {String}    access_token OAuth2 access token provided by the social service.
 *            {String}    id_token     JWT ID token such as the one provided by Google OpenID Connect.
 * @param  {String}    redirectTo   Url to redirect the user to upon successful login
 * @return {Function}               Action thunk to trigger the login process.
 */
export const connectSocialUser = ( socialInfo, redirectTo ) => dispatch => {
	dispatch( {
		type: SOCIAL_CONNECT_ACCOUNT_REQUEST,
		notice: {
			message: translate( 'Creating your account' )
		},
	} );

	return wpcom.undocumented().me().socialConnect( { ...socialInfo, redirect_to: redirectTo } ).then( wpcomResponse => {
		dispatch( {
			type: SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS,
			redirect_to: wpcomResponse.redirect_to,
		} );
	}, wpcomError => {
		const error = getErrorFromWPCOMError( wpcomError );

		dispatch( {
			type: SOCIAL_CONNECT_ACCOUNT_REQUEST_FAILURE,
			error,
		} );

		return Promise.reject( error );
	} );
};

/**
 * Attempt to disconnect the current account with a social service
 *
 * @param  {String}    socialService    The external social service name.
 * @return {Function}               Action thunk to trigger the login process.
 */
export const disconnectSocialUser = ( socialService ) => dispatch => {
	dispatch( {
		type: SOCIAL_DISCONNECT_ACCOUNT_REQUEST,
		notice: {
			message: translate( 'Creating your account' )
		},
	} );

	return wpcom.undocumented().me().socialDisconnect( socialService ).then( () => {
		dispatch( {
			type: SOCIAL_DISCONNECT_ACCOUNT_REQUEST_SUCCESS,
		} );
	}, wpcomError => {
		const error = getErrorFromWPCOMError( wpcomError );

		dispatch( {
			type: SOCIAL_DISCONNECT_ACCOUNT_REQUEST_FAILURE,
			error,
		} );

		return Promise.reject( error );
	} );
};

export const createSocialUserFailed = ( socialInfo, error ) => ( {
	type: SOCIAL_CREATE_ACCOUNT_REQUEST_FAILURE,
	authInfo: socialInfo,
	error: error.field ? error : getErrorFromWPCOMError( error )
} );

/**
 * Sends a two factor authentication recovery code to the 2FA user
 *
 * @return {Function}                Action thunk to trigger the request.
 */
export const sendSmsCode = () => ( dispatch, getState ) => {
	dispatch( {
		type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
		notice: {
			message: translate( 'Sending you a text message…' )
		},
	} );

	return request.post( addLocaleToWpcomUrl( 'https://wordpress.com/wp-login.php?action=send-sms-code-endpoint', getLocaleSlug() ) )
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
			user_id: getTwoFactorUserId( getState() ),
			two_step_nonce: getTwoFactorAuthNonce( getState(), 'sms' ),
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		} )
		.then( ( response ) => {
			const message = getSMSMessageFromResponse( response );

			dispatch( {
				type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
				notice: {
					message,
					status: 'is-success'
				},
				twoStepNonce: get( response, 'body.data.two_step_nonce' ),
			} );
		} ).catch( ( httpError ) => {
			const error = getErrorFromHTTPError( httpError );

			dispatch( {
				type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
				error,
				twoStepNonce: get( httpError, 'response.body.data.two_step_nonce' )
			} );
		} );
};

export const startPollAppPushAuth = () => ( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START } );
export const stopPollAppPushAuth = () => ( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP } );
export const formUpdate = () => ( { type: LOGIN_FORM_UPDATE } );

/**
 * Attempt to logout a user.
 *
 * @param  {String}    redirectTo         Url to redirect the user to upon successful logout
 * @return {Function}                     Action thunk to trigger the logout process.
 */
export const logoutUser = ( redirectTo ) => ( dispatch, getState ) => {
	dispatch( {
		type: LOGOUT_REQUEST,
	} );

	const currentUser = getCurrentUser( getState() );
	const logoutNonceMatches = ( currentUser.logout_URL || '' ).match( /_wpnonce=([^&]*)/ );
	const logoutNonce = logoutNonceMatches && logoutNonceMatches[ 1 ];

	return request.post( addLocaleToWpcomUrl( 'https://wordpress.com/wp-login.php?action=logout-endpoint', getLocaleSlug() ) )
		.withCredentials()
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
			redirect_to: redirectTo,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
			logout_nonce: logoutNonce,
		} ).then( ( response ) => {
			const data = get( response, 'body.data', {} );

			dispatch( {
				type: LOGOUT_REQUEST_SUCCESS,
				data,
			} );

			return Promise.resolve( data );
		} ).catch( ( httpError ) => {
			const error = getErrorFromHTTPError( httpError );

			dispatch( {
				type: LOGOUT_REQUEST_FAILURE,
				error,
			} );

			return Promise.reject( error );
		} );
};
