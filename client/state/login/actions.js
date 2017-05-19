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
	LOGIN_REQUEST,
	LOGIN_REQUEST_FAILURE,
	LOGIN_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START,
	TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
	TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
	SOCIAL_LOGIN_REQUEST,
	SOCIAL_LOGIN_REQUEST_FAILURE,
	SOCIAL_LOGIN_REQUEST_SUCCESS,
} from 'state/action-types';

const loginErrorMessages = {
	empty_password: translate( 'Please be sure to enter your password.' ),
	empty_username: translate( 'Please enter a username or email address.' ),
	incorrect_password: translate( "Oops, looks like that's not the right password. Please try again!" ),
	invalid_two_step_code: translate( "Hmm, that's not a valid verification code. Please double-check your app and try again." ),
	invalid_email: translate( "Oops, looks like that's not the right address. Please try again!" ),
	invalid_username: translate( "We don't seem to have an account with that name. Double-check the spelling and try again!" ),
	unknown: translate( "Hmm, we can't find a WordPress.com account with this username and password combo. " +
		'Please double check your information and try again.' ),
	account_unactivated: translate( "This account hasn't been activated yet — check your email for a message from " +
		"WordPress.com and click the activation link. You'll be able to log in after that." ),
	sms_recovery_code_throttled: translate( 'You can only request a recovery code via SMS once per minute. Please wait and try again.' ),
	forbidden_for_automattician: 'Cannot use social login with an Automattician account',
};

const loginErrorFields = {
	empty_password: 'password',
	empty_username: 'usernameOrEmail',
	incorrect_password: 'password',
	invalid_two_step_code: 'twoStepCode',
	invalid_email: 'usernameOrEmail',
	invalid_username: 'usernameOrEmail',
	unknown: 'global',
	account_unactivated: 'global',
};

function getMessageFromHTTPError( error ) {
	const errorKeys = get( error, 'response.body.data.errors' );

	if ( errorKeys ) {
		return errorKeys.map( errorKey => {
			if ( errorKey in loginErrorMessages ) {
				return loginErrorMessages[ errorKey ];
			}

			return errorKey;
		} ).join( ' ' );
	}

	return get( error, 'response.body.data', error.message );
}

/**
 * Attempt to login a user.
 *
 * @param  {String}    usernameOrEmail    Username or email of the user.
 * @param  {String}    password           Password of the user.
 * @param  {Boolean}   rememberMe         Whether to persist the logged in state of the user..
 * @return {Function}                     Action thunk to trigger the login process.
 */
export const loginUser = ( usernameOrEmail, password, rememberMe ) => dispatch => {
	dispatch( {
		type: LOGIN_REQUEST,
		usernameOrEmail
	} );

	return request.post( 'https://wordpress.com/wp-login.php?action=login-endpoint' )
		.withCredentials()
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
			username: usernameOrEmail,
			password,
			remember_me: rememberMe,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		} ).then( ( response ) => {
			dispatch( {
				type: LOGIN_REQUEST_SUCCESS,
				usernameOrEmail,
				rememberMe,
				data: response.body && response.body.data,
			} );
		} ).catch( ( error ) => {
			const message = getMessageFromHTTPError( error );
			const field = loginErrorFields[ get( error, 'response.body.data.errors', [] )[ 0 ] ];

			dispatch( {
				type: LOGIN_REQUEST_FAILURE,
				usernameOrEmail,
				error: { message, field },
			} );

			return Promise.reject( { message, field } );
		} );
};

/**
 * Attempt to login a user when a two factor verification code is sent.
 *
 * @param  {Number}    user_id        Id of the user trying to log in.
 * @param  {String}    two_step_code  Verification code for the user.
 * @param  {String}    two_step_nonce Nonce generated for verification code submission.
 * @param  {Boolean}   remember_me       Flag for remembering the user for a while after logging in.
 * @return {Function}                 Action thunk to trigger the login process.
 */
export const loginUserWithTwoFactorVerificationCode = ( user_id, two_step_code, two_step_nonce, remember_me ) => dispatch => {
	dispatch( { type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST } );

	return request.post( 'https://wordpress.com/wp-login.php?action=two-step-authentication-endpoint' )
		.withCredentials()
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
			user_id,
			two_step_code,
			two_step_nonce,
			remember_me,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		} )
		.then( () => {
			dispatch( { type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_SUCCESS } );
		} )
		.catch( ( error ) => {
			const errorMessage = getMessageFromHTTPError( error );

			dispatch( {
				type: TWO_FACTOR_AUTHENTICATION_LOGIN_REQUEST_FAILURE,
				error: errorMessage,
				twoStepNonce: get( error, 'response.body.data.two_step_nonce' )
			} );

			return Promise.reject( errorMessage );
		} );
};

/**
 * Attempt to login a user with an external social account.
 *
 * @param  {String}    service The external social service name.
 * @param  {String}    token   Authentication token provided by the external social service.
 * @return {Function}          Action thunk to trigger the login process.
 */
export const loginSocialUser = ( service, token ) => dispatch => {
	dispatch( { type: SOCIAL_LOGIN_REQUEST } );

	return request.post( 'https://wordpress.com/wp-login.php?action=social-login-endpoint' )
		.withCredentials()
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
			service,
			token,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		} )
		.then( () => {
			dispatch( { type: SOCIAL_LOGIN_REQUEST_SUCCESS } );
		} )
		.catch( ( error ) => {
			const errorMessage = getMessageFromHTTPError( error );

			dispatch( {
				type: SOCIAL_LOGIN_REQUEST_FAILURE,
				error: errorMessage,
			} );

			return Promise.reject( errorMessage );
		} );
};

/**
 * Sends a two factor authentication recovery code to the given user.
 *
 * @param  {Number}    userId        Id of the user trying to log in.
 * @param  {String}    twoStepNonce  Nonce generated for verification code submission.
 * @return {Function}                Action thunk to trigger the request.
 */
export const sendSmsCode = ( userId, twoStepNonce ) => dispatch => {
	dispatch( {
		type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST,
		notice: {
			message: translate( 'Sending you a text message…' )
		},
	} );

	return request.post( 'https://wordpress.com/wp-login.php?action=send-sms-code-endpoint' )
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
			user_id: userId,
			two_step_nonce: twoStepNonce,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		} )
		.then( ( response ) => {
			const phoneNumber = get( response, 'body.data.phone_number' );
			const message = translate( 'A text message with the verification code was just sent to your ' +
				'phone number ending in %(phoneNumber)s', {
					args: {
						phoneNumber
					}
				}
			);
			dispatch( {
				type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_SUCCESS,
				notice: {
					message,
					status: 'is-success'
				},
				twoStepNonce: get( response, 'body.data.two_step_nonce' ),
			} );
		} ).catch( ( error ) => {
			const field = 'global';
			const message = getMessageFromHTTPError( error );

			dispatch( {
				type: TWO_FACTOR_AUTHENTICATION_SEND_SMS_CODE_REQUEST_FAILURE,
				error: { message, field },
				twoStepNonce: get( error, 'response.body.data.two_step_nonce' )
			} );
		} );
};

export const startPollAppPushAuth = () => ( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_START } );
export const stopPollAppPushAuth = () => ( { type: TWO_FACTOR_AUTHENTICATION_PUSH_POLL_STOP } );
