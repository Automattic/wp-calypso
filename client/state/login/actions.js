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
} from 'state/action-types';

const loginErrorMessages = {
	empty_password: translate( 'The password field is empty.' ),
	empty_username: translate( 'The username field is empty.' ),
	invalid_username: translate( 'Invalid username or password.' ),
	incorrect_password: translate( 'Invalid username or password.' ),
	unknown: translate( 'Invalid username or password.' ),
	account_unactivated: translate( 'This account has not been activated. Please check your email for an activation link.' )
};

function getMessageFromHTTPError( error ) {
	const errorKeys = get( error, 'response.body.data.errors' );

	if ( errorKeys ) {
		return errorKeys.map( errorKey => loginErrorMessages[ errorKey ] ).join( ' ' );
	}

	return get( error, 'response.body.data', error.message );
}

/**
 * Attempt to login a user.
 *
 * @param  {String}    usernameOrEmail    Username or email of the user.
 * @param  {String}    password           Password of the user.
 * @return {Function}                     Action thunk to trigger the login process.
 */
export const loginUser = ( usernameOrEmail, password ) => dispatch => {
	dispatch( {
		type: LOGIN_REQUEST,
		usernameOrEmail
	} );

	return request.post( config( 'login_url_xhr' ) )
		.set( 'Content-Type', 'application/x-www-form-urlencoded' )
		.accept( 'application/json' )
		.send( {
			username: usernameOrEmail,
			password,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		} ).then( ( response ) => {
			dispatch( {
				type: LOGIN_REQUEST_SUCCESS,
				usernameOrEmail,
				data: response.body && response.body.data,
			} );
		} ).catch( ( error ) => {
			const errorMessage = getMessageFromHTTPError( error );

			dispatch( {
				type: LOGIN_REQUEST_FAILURE,
				usernameOrEmail,
				error: errorMessage,
			} );

			return Promise.reject( errorMessage );
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
export const loginUserWithTwoFactorVerificationCode = ( user_id, two_step_code, two_step_nonce, remember_me ) => {
	return request.post( config( 'two_step_authentication_xhr' ) )
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
		.then( () => { /* TODO: Handle successful request */ } )
		.catch( () => { /* TODO: Handle error */ } );
};
