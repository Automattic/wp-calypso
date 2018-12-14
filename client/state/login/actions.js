/** @format */

/**
 * External dependencies
 */
import request from 'superagent';
import { get, defer, replace } from 'lodash';
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
	LOGIN_REQUEST,
	LOGIN_REQUEST_FAILURE,
	LOGIN_REQUEST_SUCCESS,
	LOGOUT_REQUEST,
	LOGOUT_REQUEST_FAILURE,
	LOGOUT_REQUEST_SUCCESS,
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
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_COMPLETED,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE,
} from 'state/action-types';
import { getTwoFactorAuthNonce, getTwoFactorUserId } from 'state/login/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { getErrorFromHTTPError, getErrorFromWPCOMError, getSMSMessageFromResponse } from './utils';
import wpcom from 'lib/wp';
import { localizeUrl } from 'lib/i18n-utils';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import 'state/data-layer/wpcom/login-2fa';
import 'state/data-layer/wpcom/users/auth-options';

/**
 * Creates a promise that will be rejected after a given timeout
 *
 * @param {int} ms amount of milliseconds till reject the promise
 * @returns {Promise} a promise that will be rejected after ms milliseconds
 */
export const createTimingOutPromise = ms =>
	new Promise( ( _, reject ) => {
		setTimeout( () => reject( new Error( `timeout of ${ ms } reached` ) ), ms );
	} );

/**
 * Makes a request to a given link in an iframe
 *
 * @param {string} loginLink the login link to load
 * @param {int} requestTimeout amount of time to allow the link to load, default 25s
 * @returns {Promise} a promise that will be resolved if the link was successfully loaded
 */
export const makeRemoteLoginRequest = ( loginLink, requestTimeout = 25000 ) => {
	let iframe;
	const iframeLoadPromise = new Promise( resolve => {
		iframe = document.createElement( 'iframe' );
		iframe.style.display = 'none';
		iframe.setAttribute( 'scrolling', 'no' );
		iframe.onload = resolve;
		iframe.src = loginLink;
		document.body.appendChild( iframe );
	} );

	const removeIframe = () => {
		iframe.parentElement.removeChild( iframe );
	};

	return Promise.race( [ iframeLoadPromise, createTimingOutPromise( requestTimeout ) ] ).then(
		removeIframe,
		removeIframe
	);
};

/**
 * Fetch all remote login urls
 *
 * @param  {Array}   loginLinks     Array of urls
 * @return {Promise}                A promise that always resolve
 */
export const remoteLoginUser = loginLinks => {
	return Promise.all(
		loginLinks
			.map( loginLink => makeRemoteLoginRequest( loginLink ) )
			// make sure we continue even when a remote login fails
			.map( promise => promise.catch( () => {} ) )
	);
};

/**
 * Logs a user in.
 *
 * @param  {String}   usernameOrEmail Username or email of the user
 * @param  {String}   password        Password of the user
 * @param  {String}   redirectTo      Url to redirect the user to upon successful login
 * @param  {String}   domain          A domain to reverse login to
 * @return {Function}                 A thunk that can be dispatched
 */
export const loginUser = ( usernameOrEmail, password, redirectTo, domain ) => dispatch => {
	dispatch( {
		type: LOGIN_REQUEST,
	} );

	return request
		.post( localizeUrl( 'https://wordpress.com/wp-login.php?action=login-endpoint' ) )
		.withCredentials()
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
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

export const updateNonce = ( nonceType, twoStepNonce ) => ( {
	type: TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE,
	nonceType,
	twoStepNonce,
} );

/**
 * Logs a user in with a two factor verification code.
 *
 * @param  {String}   twoStepCode       Verification code received by the user
 * @param  {String}   twoFactorAuthType Two factor authentication method (sms, push ...)
 * @return {Function}                   A thunk that can be dispatched
 */
export const loginUserWithTwoFactorVerificationCode = ( twoStepCode, twoFactorAuthType ) => (
	dispatch,
	getState
) => {
	dispatch( { type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST } );

	return request
		.post(
			localizeUrl( 'https://wordpress.com/wp-login.php?action=two-step-authentication-endpoint' )
		)
		.withCredentials()
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
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

/**
 * Logs a user in from a third-party social account (Google ...).
 *
 * @param  {Object}   socialInfo     Object containing { service, access_token, id_token }
 *           {String}   service      The external social service name
 *           {String}   access_token OAuth2 access token provided by the social service
 *           {String}   id_token     JWT ID token such as the one provided by Google OpenID Connect.
 * @param  {String}   redirectTo     Url to redirect the user to upon successful login
 * @return {Function}                A thunk that can be dispatched
 */
export const loginSocialUser = ( socialInfo, redirectTo ) => dispatch => {
	dispatch( { type: SOCIAL_LOGIN_REQUEST } );

	return request
		.post( localizeUrl( 'https://wordpress.com/wp-login.php?action=social-login-endpoint' ) )
		.withCredentials()
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
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
 * @param  {Object}   socialInfo     Object containing { service, access_token, id_token }
 *           {String}   service      The external social service name
 *           {String}   access_token OAuth2 access token provided by the social service
 *           {String}   id_token     JWT ID token such as the one provided by Google OpenID Connect
 * @param  {String}   flowName       The name of the current signup flow
 * @return {Function}                A thunk that can be dispatched
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
 * @param  {Object}   socialInfo     Object containing { service, access_token, id_token, redirectTo }
 *           {String}   service      The external social service name
 *           {String}   access_token OAuth2 access token provided by the social service
 *           {String}   id_token     JWT ID token such as the one provided by Google OpenID Connect
 * @param  {String}   redirectTo     Url to redirect the user to upon successful login
 * @return {Function}                A thunk that can be dispatched
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
 * @param  {String}   socialService The social service name
 * @return {Function}               A thunk that can be dispatched
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
 * @return {Function} A thunk that can be dispatched
 */
export const sendSmsCode = () => ( dispatch, getState ) => {
	dispatch( {
		type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
		notice: {
			message: translate( 'Sending you a text message…' ),
		},
	} );

	return request
		.post( localizeUrl( 'https://wordpress.com/wp-login.php?action=send-sms-code-endpoint' ) )
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
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
 * Logs the current user out.
 *
 * @param  {String}   redirectTo Url to redirect the user to upon successful logout
 * @return {Function}            A thunk that can be dispatched
 */
export const logoutUser = redirectTo => ( dispatch, getState ) => {
	dispatch( {
		type: LOGOUT_REQUEST,
	} );

	const currentUser = getCurrentUser( getState() );
	const logoutNonceMatches = ( currentUser.logout_URL || '' ).match( /_wpnonce=([^&]*)/ );
	const logoutNonce = logoutNonceMatches && logoutNonceMatches[ 1 ];

	return request
		.post( localizeUrl( 'https://wordpress.com/wp-login.php?action=logout-endpoint' ) )
		.withCredentials()
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
			redirect_to: redirectTo,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
			logout_nonce: logoutNonce,
		} )
		.then( response => {
			const data = get( response, 'body.data', {} );

			dispatch( {
				type: LOGOUT_REQUEST_SUCCESS,
				data,
			} );

			return Promise.resolve( data );
		} )
		.catch( httpError => {
			const error = getErrorFromHTTPError( httpError );

			dispatch( {
				type: LOGOUT_REQUEST_FAILURE,
				error,
			} );

			return Promise.reject( error );
		} );
};

/**
 * Retrieves the type of authentication of the account (regular, passwordless ...) of the specified user.
 *
 * @param  {String}   usernameOrEmail Identifier of the user
 * @return {Function}                 A thunk that can be dispatched
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
 * @return {Object} An action that can be dispatched
 */
export const resetAuthAccountType = () => ( {
	type: LOGIN_AUTH_ACCOUNT_TYPE_RESET,
} );

/**
 * Creates an action that indicates that the push poll is completed
 *
 * @param {Array<String>} tokenLinks token links array
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
