/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	LOGIN_REQUEST,
	LOGIN_REQUEST_FAILURE,
	LOGIN_REQUEST_SUCCESS,
	LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST,
	LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST_FAILURE,
	LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST_SUCCESS,
	LOGIN_2FA_VERIFICATION_CODE_CLEAR_ERROR
} from 'state/action-types';
import wp from 'lib/wp';

/**
 * Attempt to login a user.
 *
 * @param  {String}    username_or_email  Username or email of the user.
 * @param  {String}    password           Password of the user.
 * @return {Function}                     Action thunk to trigger the login process.
 */
export const loginUser = ( username_or_email, password ) => {
	return ( dispatch ) => {
		dispatch( {
			type: LOGIN_REQUEST,
			username_or_email,
			password
		} );

		return wp.undocumented().login( username_or_email, password )
			.then( ( data ) => {
				dispatch( {
					type: LOGIN_REQUEST_SUCCESS,
					username_or_email,
					password,
					data,
				} );
			} ).catch( ( error ) => {
				dispatch( {
					type: LOGIN_REQUEST_FAILURE,
					username_or_email,
					password,
					error: error.message
				} );
			} );
	};
};

/**
 * Attempt to login a user when a two factor verification code is sent.
 *
 * @param  {Number}    twostep_id            Id of the user trying to log in.
 * @param  {String}    twostep_code  Verification code for the user.
 * @param  {String}    twostep_nonce              Nonce generated for verification code submission.
 * @param  {Boolean}   remember           Flag for remembering the user for a while after logging in.
 * @return {Function}                     Action thunk to trigger the login process.
 */
export const loginUserWithTwoFactorVerificationCode = ( twostep_id, twostep_code, twostep_nonce, remember ) => {
	return ( dispatch ) => {
		dispatch( {
			type: LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST,
			twostep_id,
			twostep_code,
			twostep_nonce,
			remember
		} );

		return wp.undocumented().loginWithTwoFactorVerificationCode( twostep_id, twostep_code, twostep_nonce, remember )
			.then( ( data ) => {
				dispatch( {
					type: LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST_SUCCESS,
					twostep_id,
					twostep_code,
					twostep_nonce,
					data,
				} );
			} ).catch( ( error ) => {
				dispatch( {
					type: LOGIN_2FA_VERIFICATION_CODE_SEND_REQUEST_FAILURE,
					twostep_id,
					twostep_code,
					twostep_nonce,
					error: error.message
				} );
			} );
	};
};

/**
 * Clear the error flag that is set in the state tree when there was an unsuccessful
 * verification code submission.
 *
 * @param  {Boolean}   remember           Flag for remembering the user for a while after logging in.
 * @return {Object}                       Action to trigger the flag clearing.
 */
export const clearTwoFactorVerficationCodeSubmissionError = () => {
	return {
		type: LOGIN_2FA_VERIFICATION_CODE_CLEAR_ERROR
	};
};

export const internalRedirect = ( url ) => {
	return () => {
		page.redirect( url );
	};
};
