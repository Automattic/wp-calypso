/**
 * External dependencies
 */
import { get, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/login/init';

/**
 * Retrieve the user ID for the two factor authentication process.
 * Returns null if there is no such information yet, or user does not have 2FA enabled.
 *
 * @param  {object}   state  Global state tree
 * @returns {?number}         The user ID.
 */
export const getTwoFactorUserId = state => {
	return get( state, 'login.twoFactorAuth.user_id', null );
};

/**
 * Retrieve the actual nonce for the two factor authentication process.
 * Returns null if there is no such information yet, or user does not have 2FA enabled.
 *
 * @param	{object}	state  Global state tree
 * @param	{string}	nonceType nonce's type
 * @returns {?string}         The nonce.
 */
export const getTwoFactorAuthNonce = ( state, nonceType ) => {
	return state.login.twoFactorAuth[ `two_step_nonce_${ nonceType }` ] ?? null;
};

/**
 * Retrieve the type of notification sent for the two factor authentication process.
 * Returns null if there is no such information yet, or user does not have 2FA enabled.
 *
 * @param  {object}   state  Global state tree
 * @returns {?string}         The type of 2FA notification. enum: 'sms', 'push', 'none'.
 */
export const getTwoFactorNotificationSent = state => {
	return get( state, 'login.twoFactorAuth.two_step_notification_sent', null );
};

/**
 * Retrieve a token to be used for push notification auth polling
 *
 * @param  {object}   state  Global state tree
 * @returns {?string}         Push notification token to be used for polling auth state
 */
export const getTwoFactorPushToken = state =>
	get( state, 'login.twoFactorAuth.push_web_token', null );

/**
 * Retrieve the progress status of polling for push authentication
 *
 * @param  {object}   state  Global state tree
 * @returns {boolean}         Whether the polling for push authentication is in progress
 */
export const getTwoFactorPushPollInProgress = state =>
	get( state, 'login.twoFactorAuthPushPoll.inProgress', false );

/**
 * Get whether user logged in successfully via push auth
 *
 * @param  {object}   state  Global state tree
 * @returns {boolean}         Whether the polling for push authentication completed successfully
 */
export const getTwoFactorPushPollSuccess = state =>
	get( state, 'login.twoFactorAuthPushPoll.success', false );

/**
 * Determines whether two factor authentication is enabled for the logging in user.
 *
 * @param  {object}   state  Global state tree
 * @returns {boolean}        Whether 2FA is enabled
 */
export const isTwoFactorEnabled = state => {
	const twoFactorAuth = get( state, 'login.twoFactorAuth' );

	return ! isEmpty( twoFactorAuth );
};

/**
 * Determines whether a request to authenticate 2FA is being made.
 *
 * @param  {object}   state  Global state tree
 * @returns {boolean}         Whether a request to authenticate 2FA is being made.
 */
export const isRequestingTwoFactorAuth = state => {
	return get( state, 'login.isRequestingTwoFactorAuth', false );
};

/**
 * Returns the error for a request to authenticate 2FA.
 *
 * @param  {object}   state  Global state tree
 * @returns {?string}         Error for the request.
 */
export const getTwoFactorAuthRequestError = state => {
	return get( state, 'login.twoFactorAuthRequestError', null );
};

/**
 * Retrieves the supported auth types for the current login.
 * Returns null if there is no such information yet.
 *
 * @param  {object}   state  Global state tree
 * @returns {?Array}          The supported auth types (of `authenticator`, `sms`, `push` ).
 */
export const getTwoFactorSupportedAuthTypes = state => {
	return get( state, 'login.twoFactorAuth.two_step_supported_auth_types', null );
};

/**
 * Determines whether an auth type is supported for the current login.
 * Returns null if there is no such information yet.
 *
 * @param  {object}   state  Global state tree
 * @param  {string}   type   A 2FA auth type (of `authenticator`, `sms`, `push` ).
 * @returns {?boolean}        Whether the auth type `type` is supported
 */
export const isTwoFactorAuthTypeSupported = ( state, type ) => {
	const supportedAuthTypes = getTwoFactorSupportedAuthTypes( state );
	return supportedAuthTypes && supportedAuthTypes.indexOf( type ) >= 0;
};

/**
 * Determines whether a login request is in-progress.
 *
 * @param  {object}   state  Global state tree
 * @returns {boolean}         Whether a login request is in-progress.
 */
export const isRequesting = state => {
	return get( state, 'login.isRequesting', false );
};

/**
 * Returns the error for a login request.
 *
 * @param  {object}   state  Global state tree
 * @returns {?object}         Error for the request.
 */
export const getRequestError = state => {
	return get( state, 'login.requestError', null );
};

/**
 * Returns the notice for a login request.
 *
 * @param  {object}   state  Global state tree
 * @returns {?object}         Notice for the request.
 */
export const getRequestNotice = state => {
	return get( state, 'login.requestNotice', null );
};

/**
 * Retrieves the last redirect url provided in the query parameters of any login page. This url must be sanitized by the
 * API before being used to avoid open redirection attacks.
 *
 * @param  {object}   state  Global state tree
 * @returns {?string}         Url to redirect the user to upon successful login
 * @see getRedirectToSanitized for the sanitized version
 */
export const getRedirectToOriginal = state => {
	return get( state, 'login.redirectTo.original', null );
};

/**
 * Retrieves the last redirect url provided in the query parameters of any login page that was sanitized by the API
 * during the authentication process.
 *
 * @param  {object}   state  Global state tree
 * @returns {?string}         Url to redirect the user to upon successful login
 */
export const getRedirectToSanitized = state => {
	return get( state, 'login.redirectTo.sanitized', null );
};

/**
 * Retrieves whether the login form should be disabled due to actions.
 *
 * @param  {object}   state  Global state tree
 * @returns {boolean}         Login form disabled flag
 */
export const isFormDisabled = state => {
	return get( state, 'login.isFormDisabled', false );
};

/**
 * Retrieves the authentication account type.
 *
 * @param  {object}   state  Global state tree
 * @returns {?string}        Authentication account type (e.g. 'regular', 'passwordless' ...)
 */
export const getAuthAccountType = state => {
	return get( state, 'login.authAccountType', null );
};

/**
 * Tells us if we're in a process of creating a social account
 *
 * @param  {object}   state  Global state tree
 * @returns {?boolean}         Error for the request.
 */
export const isSocialAccountCreating = state =>
	get( state, 'login.socialAccount.isCreating', null );

/**
 * Gets Username of the created social account
 *
 * @param  {object}   state  Global state tree
 * @returns {?string}         Username of the created social account
 */
export const getCreatedSocialAccountUsername = state =>
	get( state, 'login.socialAccount.username', null );

/**
 * Gets Bearer token of the created social account
 *
 * @param  {object}   state  Global state tree
 * @returns {?string}         Bearer token of the created social account
 */
export const getCreatedSocialAccountBearerToken = state =>
	get( state, 'login.socialAccount.bearerToken', null );

/**
 * Gets error for the create social account request.
 *
 * @param  {object}   state  Global state tree
 * @returns {?object}         Error for the create social account request.
 */
export const getCreateSocialAccountError = state =>
	get( state, 'login.socialAccount.createError', null );

/**
 * Gets error for the get social account request.
 *
 * @param  {object}   state  Global state tree
 * @returns {?object}         Error for the get social account request.
 */
export const getRequestSocialAccountError = state =>
	get( state, 'login.socialAccount.requestError', null );

/**
 * Gets social account linking status
 *
 * @param  {object}   state  Global state tree
 * @returns {?boolean}         Boolean describing social account linking status
 */
export const getSocialAccountIsLinking = state =>
	get( state, 'login.socialAccountLink.isLinking', null );

/**
 * Gets social account linking email
 *
 * @param  {object}   state  Global state tree
 * @returns {?string}         wpcom email that is being linked
 */
export const getSocialAccountLinkEmail = state =>
	get( state, 'login.socialAccountLink.email', null );

/**
 * Gets social account linking service
 *
 * @param  {object}   state  Global state tree
 * @returns {?string}         service name that is being linked
 */
export const getSocialAccountLinkService = state =>
	get( state, 'login.socialAccountLink.authInfo.service', null );

/**
 * Gets the auth information of the social account to be linked.
 *
 * @param  {object}   state  Global state tree
 * @returns {?string}         Email address of the social account.
 */
export const getSocialAccountLinkAuthInfo = state =>
	get( state, 'login.socialAccountLink.authInfo', null );
