/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieve the user ID for the two factor authentication process.
 * Returns null if there is no such information yet, or user does not have 2FA enabled.
 *
 * @param  {Object}   state  Global state tree
 * @return {?Number}         The user ID.
 */
export const getTwoFactorAuthId = ( state ) => {
	return get( state, [ 'login', 'twoFactorAuth', 'two_step_id' ], null );
};

/**
 * Retrieve the actual nonce for the two factor authentication process.
 * Returns null if there is no such information yet, or user does not have 2FA enabled.
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         The nonce.
 */
export const getTwoFactorAuthNonce = ( state ) => {
	return get( state, [ 'login', 'twoFactorAuth', 'two_step_nonce' ], null );
};

/**
 * Retrieve the type for the two factor authentication process.
 * Returns null if there is no such information yet, or user does not have 2FA enabled.
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         The type of 2FA enabled. enum: 'code', 'sms', 'push'.
 */
export const getTwoFactorAuthType = ( state ) => {
	return get( state, [ 'login', 'twoFactorAuth', 'two_step_type' ], null );
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
		twoFactorAuth &&
		twoFactorAuth.two_step_id !== '' &&
		twoFactorAuth.two_step_nonce !== ''
	);
};
