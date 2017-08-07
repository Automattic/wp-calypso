/**
 * External dependencies
 */
import request from 'superagent';
import { get } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import {
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
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE,
} from 'state/action-types';
import {
	getRememberMe,
	getTwoFactorAuthNonce,
	getTwoFactorUserId,
} from 'state/login/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import wpcom from 'lib/wp';
import { addLocaleToWpcomUrl, getLocaleSlug } from 'lib/i18n-utils';

// TODO: Remove when we're done with the fallback.
function getErrorMessageFromErrorCode( code ) {
	const errorMessages = {
		account_unactivated: translate( "This account hasn't been activated yet — check your email for a message from " +
			"WordPress.com and click the activation link. You'll be able to log in after that." ),
		empty_password: translate( "Don't forget to enter your password." ),
		empty_two_step_code: translate( 'Please enter a verification code.' ),
		empty_username: translate( 'Please enter a username or email address.' ),
		forbidden_for_automattician: 'Cannot use social login with an Automattician account',
		incorrect_password: translate( "Oops, that's not the right password. Please try again!" ),
		invalid_email: translate( "Oops, looks like that's not the right address. Please try again!" ),
		invalid_two_step_code: translate( "Hmm, that's not a valid verification code. Please double-check your app and try again." ),
		invalid_two_step_nonce: translate( 'Your session has expired, please go back to the login screen.' ),
		invalid_username: translate( "We don't seem to have an account with that name. Double-check the spelling and try again!" ),
		login_limit_exceeded: translate( "Slow down, you're trying to log in too fast." ),
		push_authentication_throttled: translate( 'You can only request a code via the WordPress mobile app once every ' +
			'two minutes. Please wait and try again.' ),
		sms_code_throttled: translate( 'You can only request a code via text message once per minute. Please wait and try again.' ),
		sms_recovery_code_throttled: translate( 'You can only request a recovery code via text message once per minute. ' +
			'Please wait and try again.' ),
		unknown: translate( "Hmm, we can't find a WordPress.com account with this username and password combo. " +
			'Please double check your information and try again.' ),
	};

	if ( code in errorMessages ) {
		return errorMessages[ code ];
	}

	return code;
}

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
	let message;
	let field = 'global';

	if ( ! httpError.status ) {
		return {
			code: 'network_error',
			message: httpError.message,
			field
		};
	}

	// TODO: Simplify this block when we're done with the fallback.
	let code = get( httpError, 'response.body.data.errors[0]' );
	if ( typeof code === 'object' ) {
		message = code.message;
		code = code.code;
	} else {
		message = getErrorMessageFromErrorCode( code );
	}

	if ( code ) {
		if ( code in errorFields ) {
			field = errorFields[ code ];
		}

		if ( ! message ) {
			message = get( httpError, 'response.body.data', httpError.message );
		}
	}

	return { code, message, field };
}

// TODO: Remove when we're done with the fallback.
const wpcomErrorMessages = {
	user_exists: translate( 'Your Google email address is already in use WordPress.com. ' +
		'Log in to your account using your email address or username, and your password. ' +
		'To create a new WordPress.com account, use a different Google account.' )
};

/**
 * Transforms WPCOM error to the error object we use for login purposes
 *
 * @param {Object} wpcomError HTTP error
 * @returns {{message: string, field: string, code: string}} an error message and the id of the corresponding field
 */
const getErrorFromWPCOMError = ( wpcomError ) => ( {
	// TODO: Remove wpcomErrorMessages[] reference when we're done with the fallback.
	message: wpcomError.message || wpcomErrorMessages[ wpcomError.error ],
	code: wpcomError.error,
	field: 'global',
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
 * @param  {String}    service    The external social service name.
 * @param  {String}    token      Authentication token provided by the external social service.
 * @param  {String}    redirectTo Url to redirect the user to upon successful login
 * @return {Function}             Action thunk to trigger the login process.
 */
export const loginSocialUser = ( service, token, redirectTo ) => dispatch => {
	dispatch( { type: SOCIAL_LOGIN_REQUEST } );

	return request.post( addLocaleToWpcomUrl( 'https://wordpress.com/wp-login.php?action=social-login-endpoint', getLocaleSlug() ) )
		.withCredentials()
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
			service,
			token,
			redirect_to: redirectTo,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		} )
		.then( ( response ) => {
			dispatch( {
				type: SOCIAL_LOGIN_REQUEST_SUCCESS,
				redirectTo: get( response, 'body.data.redirect_to' ),
			} );
		} )
		.catch( ( httpError ) => {
			const error = getErrorFromHTTPError( httpError );
			error.email = get( httpError, 'response.body.data.email' );

			dispatch( {
				type: SOCIAL_LOGIN_REQUEST_FAILURE,
				error,
				service: service,
				token: token,
			} );

			return Promise.reject( error );
		} );
};

/**
 * Attempt to create an account with a social service
 *
 * @param  {String}    service    The external social service name.
 * @param  {String}    token      Authentication token provided by the external social service.
 * @param  {String}    flowName   the name of the signup flow
 * @return {Function}             Action thunk to trigger the login process.
 */
export const createSocialUser = ( service, token, flowName ) => dispatch => {
	dispatch( {
		type: SOCIAL_CREATE_ACCOUNT_REQUEST,
		notice: {
			message: translate( 'Creating your account' )
		},
	} );

	return wpcom.undocumented().usersSocialNew( service, token, flowName ).then( wpcomResponse => {
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
 * @param  {String}    service    The external social service name.
 * @param  {String}    token      Authentication token provided by the external social service.
 * @param  {String}    redirectTo Url to redirect the user to upon successful login
 * @return {Function}             Action thunk to trigger the login process.
 */
export const connectSocialUser = ( service, token, redirectTo ) => dispatch => {
	dispatch( {
		type: SOCIAL_CONNECT_ACCOUNT_REQUEST,
		notice: {
			message: translate( 'Creating your account' )
		},
	} );

	return wpcom.undocumented().me().socialConnect( service, token, redirectTo ).then( wpcomResponse => {
		dispatch( {
			type: SOCIAL_CONNECT_ACCOUNT_REQUEST_SUCCESS,
			redirectTo: wpcomResponse.redirect_to,
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
