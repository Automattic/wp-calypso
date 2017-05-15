/**
 * Internal dependencies
 */
import {
	SUPPORT_USER_ACTIVATE,
	SUPPORT_USER_ERROR,
	SUPPORT_USER_PREFILL,
	SUPPORT_USER_SET_USERNAME,
	SUPPORT_USER_TOKEN_FETCH,
	SUPPORT_USER_TOGGLE_DIALOG,
} from 'state/action-types';

/**
 * Dispatched when a support user token is being fetched
 *
 * @param  {string} supportUser     Support username
 * @return {thunk}                  The action thunk
 */
export function supportUserTokenFetch( supportUser ) {
	return {
		type: SUPPORT_USER_TOKEN_FETCH,
		supportUser
	};
}

export function supportUserActivate() {
	return {
		type: SUPPORT_USER_ACTIVATE
	}
}

/**
 * Display the support user dialog with a pre-filled username
 * @param {string} userName The username to prefill in the form
 * @return {Object}         Action object
 */
export function supportUserPrefill( username ) {
	return {
		type: SUPPORT_USER_PREFILL,
		username,
	};
}

/**
 * Set the username in the support user dialog
 * @param {string} userName The username to prefill in the form
 * @return {Object}         Action object
 */
export function supportUserSetUsername( username ) {
	return {
		type: SUPPORT_USER_SET_USERNAME,
		username,
	};
}

/**
 * Dispatched when an error occurs while attempting to activate support user
 * @param  {string} errorMessage Message describing the error to display to the user
 * @return {Object}              Action object
 */
export function supportUserError( errorMessage = null ) {
	return {
		type: SUPPORT_USER_ERROR,
		errorMessage
	}
}

export function supportUserToggleDialog() {
	return {
		type: SUPPORT_USER_TOGGLE_DIALOG
	}
}
