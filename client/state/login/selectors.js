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

/***
 * Retrieve a token to be used for push notification auth polling
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         Push notification token to be used for polling auth state
 */
export const getTwoFactorPushToken = state => get( state, 'login.twoFactorAuth.push_web_token', null );

/***
 * Retrieve the remember me flag that was set when logging in
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}         Remember me flag for authentication
 */
export const getTwoFactorRememberMe = state => get( state, 'login.twoFactorAuth.remember_me', false );

/***
 * Retrieve the progress status of polling for push authentication
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}         Whether the polling for push authentication is in progress
 */
export const getTwoFactorPushPollInProgress = state => get( state, 'login.twoFactorAuthPushPoll.inProgress', false );

/***
 * Get whether user logged in successfully via push auth
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}         Whether the polling for push authentication completed successfully
 */
export const getTwoFactorPushPollSuccess = state => get( state, 'login.twoFactorAuthPushPoll.success', false );

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

/**
 * Determines whether an auth type is supported for the current login.
 * Returns null if there is no such information yet.
 *
 * @param  {Object}   state  Global state tree
 * @param  {String}   type   A 2FA auth type (of `authenticator`, `sms`, `push` ).
 * @return {?Boolean}        Whether the auth type `type` is supported
 */
export const isTwoFactorAuthTypeSupported = ( state, type ) => {
	const supportedAuthTypes = getTwoFactorSupportedAuthTypes( state );
	return supportedAuthTypes && supportedAuthTypes.indexOf( type ) >= 0;
};

/**
 * Determines whether a login request is in-progress.
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}         Whether a login request is in-progress.
 */
export const isRequesting = ( state ) => {
	return get( state, 'login.isRequesting', false );
};

/**
 * Returns the error for a login request.
 *
 * @param  {Object}   state  Global state tree
 * @return {?Object}         Error for the request.
 */
export const getRequestError = ( state ) => {
	return get( state, 'login.requestError', null );
};

/**
 * Returns the notice for a login request.
 *
 * @param  {Object}   state  Global state tree
 * @return {?Object}         Notice for the request.
 */
export const getRequestNotice = ( state ) => {
	return get( state, 'login.requestNotice', null );
};
