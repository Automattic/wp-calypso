/**
 * External dependencies
 */
import { get, isEmpty } from 'lodash';

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
 * @param	{Object}	state  Global state tree
 * @param	{String}	nonceType nonce's type
 * @return {?String}         The nonce.
 */
export const getTwoFactorAuthNonce = ( state, nonceType ) => {
	return get( state, `login.twoFactorAuth.two_step_nonce_${ nonceType }`, null );
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
 * Determines whether two factor authentication is enabled for the logging in user.
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}        Whether 2FA is enabled
 */
export const isTwoFactorEnabled = ( state ) => {
	const twoFactorAuth = get( state, 'login.twoFactorAuth' );

	return ! isEmpty( twoFactorAuth );
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

/***
 * Retrieves the redirect url that was passed when logging in.
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         Url to redirect the user to upon successful login
 */
export const getRedirectTo = ( state ) => {
	return get( state, 'login.redirectTo', null );
};

/***
 * Retrieves the remember me flag that was set when logging in.
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}         Remember me flag for authentication
 */
export const getRememberMe = ( state ) => {
	return get( state, 'login.rememberMe', false );
};

/***
 * Retrieves whether the login form should be disabled due to actions.
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}         Login form disabled flag
 */
export const isFormDisabled = ( state ) => {
	return get( state, 'login.isFormDisabled', false );
};

/***
 * Tells us if we're in a process of creating a social account
 *
 * @param  {Object}   state  Global state tree
 * @return {?Boolean}         Error for the request.
 */
export const isSocialAccountCreating = ( state ) => get( state, 'login.socialAccount.isCreating', null );

/***
 * Gets Username of the created social account
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         Username of the created social account
 */
export const getCreatedSocialAccountUsername = ( state ) => get( state, 'login.socialAccount.username', null );

/***
 * Gets Bearer token of the created social account
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         Bearer token of the created social account
 */
export const getCreatedSocialAccountBearerToken = ( state ) => get( state, 'login.socialAccount.bearerToken', null );

/***
 * Gets error for the create social account request.
 *
 * @param  {Object}   state  Global state tree
 * @return {?Object}         Error for the create social account request.
 */
export const getCreateSocialAccountError = ( state ) => get( state, 'login.socialAccount.createError', null );

/***
 * Gets error for the get social account request.
 *
 * @param  {Object}   state  Global state tree
 * @return {?Object}         Error for the get social account request.
 */
export const getRequestSocialAccountError = ( state ) => get( state, 'login.socialAccount.requestError', null );

/***
 * Gets the OAuth2 client data.
 *
 * @param  {Object}   state  Global state tree
 * @return {Object}          OAuth2 client data
 */
export const getOAuth2ClientData = ( state ) => get( state, 'login.oauth2ClientData', null );

/***
 * Determines if the OAuth2 layout should be used.
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}         Whether the OAuth2 layout should be used.
 */
export const showOAuth2Layout = ( state ) => get( state, 'login.showOAuth2Layout', false );

/***
 * Gets social account linking status
 *
 * @param  {Object}   state  Global state tree
 * @return {?Boolean}         Boolean describing social account linking status
 */
export const getSocialAccountIsLinking = ( state ) => get( state, 'login.socialAccountLink.isLinking', null );

/***
 * Gets social account linking email
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         wpcom email that is being linked
 */
export const getSocialAccountLinkEmail = ( state ) => get( state, 'login.socialAccountLink.email', null );

/***
 * Gets social account linking service
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         service name that is being linked
 */
export const getSocialAccountLinkService = ( state ) => get( state, 'login.socialAccountLink.authInfo.service', null );

/***
 * Gets the auth information of the social account to be linked.
 *
 * @param  {Object}   state  Global state tree
 * @return {?String}         Email address of the social account.
 */
export const getSocialAccountLinkAuthInfo = ( state ) => get( state, 'login.socialAccountLink.authInfo', null );
