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
export const getTwoFactorUserId = ( state ) => {
	return get( state, 'login.twoFactorAuth.user_id', null );
};

/**
 * Retrieve the actual nonce for the two factor authentication process.
 * Returns null if there is no such information yet, or user does not have 2FA enabled.
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         The nonce.
 */
export const getTwoFactorAuthNonce = ( state ) => {
	return get( state, 'login.twoFactorAuth.two_step_nonce', null );
};

/**
 * Retrieve the type of notification sent for the two factor authentication process.
 * Returns null if there is no such information yet, or user does not have 2FA enabled.
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         The type of 2FA notification. enum: 'sms', 'push', 'none'.
 */
export const getTwoFactorNotificationSent = ( state ) => {
	return get( state, 'login.twoFactorAuth.two_step_notification_sent', null );
};

/**
 * True if two factor authentication is enabled for the logging in user.
 * False if not, null if the information is not available yet.
 *
 * @param  {Object}   state  Global state tree
 * @return {?Boolean}        Whether 2FA is enabled
 */
export const isTwoFactorEnabled = ( state ) => {
	const twoFactorAuth = get( state, 'login.twoFactorAuth' );
	if ( ! twoFactorAuth ) {
		return null;
	}

	return (
		twoFactorAuth.two_step_id !== '' &&
		twoFactorAuth.two_step_nonce !== ''
	);
};

/**
 * Determines whether a request to authenticate 2FA is being made.
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}         Whether a request to authenticate 2FA is being made.
 */
export const isRequestingTwoFactorAuth = ( state ) => {
	return get( state, 'login.isRequestingTwoFactorAuth', false );
};

/**
 * Returns the error for a request to authenticate 2FA.
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         Error for the request.
 */
export const getTwoFactorAuthRequestError = ( state ) => {
	return get( state, 'login.twoFactorAuthRequestError', null );
};

/**
 * Retrieves the supported auth types for the current login.
 * Returns null if there is no such information yet.
 *
 * @param  {Object}   state  Global state tree
 * @return {?Array}          The supported auth types (of `authenticator`, `sms`, `push` ).
 */
export const getTwoFactorSupportedAuthTypes = ( state ) => {
	return get( state, 'login.twoFactorAuth.two_step_supported_auth_types', null );
};
