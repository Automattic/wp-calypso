/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Whether a login request is currently in process.
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}         True if the login request is in process, false otherwise.
 */
export const isRequestingLogin = ( state ) => {
	return get( state, [ 'login', 'isRequesting' ], false );
};

/**
 * Whether the last login request was successful.
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}         True if the login request was successful, false otherwise.
 */
export const isLoginSuccessful = ( state ) => {
	return get( state, [ 'login', 'requestSuccess' ], false );
};

/**
 * Retrieve the last login request error.
 * Returns null if there was no error at the last request.
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         The last login request error, null if none.
 */
export const getError = ( state ) => {
	return get( state, [ 'login', 'requestError' ], null );
};

/**
 * Retrieve the user ID for the two factor authentication process.
 * Returns null if there is no such information yet, or user does not have 2FA enabled.
 *
 * @param  {Object}   state  Global state tree
 * @return {?Number}         The user ID.
 */
export const getTwoFactorAuthId = ( state ) => {
	return get( state, [ 'login', 'twoFactorAuth', 'twostep_id' ], null );
};

/**
 * Retrieve the actual nonce for the two factor authentication process.
 * Returns null if there is no such information yet, or user does not have 2FA enabled.
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         The nonce.
 */
export const getTwoFactorAuthNonce = ( state ) => {
	return get( state, [ 'login', 'twoFactorAuth', 'twostep_nonce' ], null );
};

/**
 * True if two factor authentication is enabled for the logging in user.
 * False if not, null if the information is not available yet.
 *
 * @param  {Object}   state  Global state tree
 * @return {?Boolean}        Whether 2FA is enabled
 */
export const isTwoFactorEnabled = ( state ) => {
	const twoFactorAuth = get( state, [ 'login', 'twoFactorAuth' ] );
	if ( ! twoFactorAuth ) {
		return null;
	}

	return (
		twoFactorAuth.result &&
		twoFactorAuth.twostep_id !== '' &&
		twoFactorAuth.twostep_nonce !== ''
	);
};

/**
 * Retrieve the last verification code submission error.
 * Returns null if there was no error at the last request.
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         The last verification code request error, null if none.
 */
export const getVerificationCodeSubmissionError = ( state ) => {
	return get( state, [ 'login', 'verificationCodeSubmissionError' ] );
};
