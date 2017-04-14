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
		} ).then( ( reponse ) => {
			dispatch( {
				type: LOGIN_REQUEST_SUCCESS,
				usernameOrEmail,
				data: reponse.body,
			} );
		} ).catch( ( error ) => {
			let errorMessage;
			const errorKeys = get( error, 'response.body.data.errors' );
			if ( errorKeys ) {
				errorMessage = errorKeys.map( errorKey => loginErrorMessages[ errorKey ] ).join( ' ' );
			} else {
				errorMessage = get( error, 'response.body.data' ) || error.message;
			}
			dispatch( {
				type: LOGIN_REQUEST_FAILURE,
				usernameOrEmail,
				error: errorMessage
			} );

			return Promise.reject( errorMessage );
		} );
};
