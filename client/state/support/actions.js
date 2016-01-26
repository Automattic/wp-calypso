/**
 * Internal dependencies
 */
import {
	SUPPORT_USER_ACTIVATED,
	SUPPORT_USER_DEACTIVATED,
	SUPPORT_USER_FETCH_TOKEN,
} from 'state/action-types';

import User from 'lib/user';

import userSettings from 'lib/user-settings';

/**
 * Requests a support user token, then dispatches the relevant actions upon response
 *
 * @param  {string} supportUser     Support username
 * @param  {string} supportPassword Support password
 * @return {thunk}                  The action thunk
 */
export function supportUserFetchToken( supportUser, supportPassword ) {
	return ( dispatch ) => {
		if ( !supportUser || !supportPassword ) {
			return;
		}

		dispatch( {
			type: SUPPORT_USER_FETCH_TOKEN,
			supportUser
		} );

		const user = new User();

		const activateSupportUser = () =>
			dispatch( supportUserActivated( Object.assign( {}, user.data ) ) );

		const tokenErrorCallback = ( error ) =>
			dispatch( supportUserDeactivated( error.message ) );

		const changeUserCallback = error => error
			? tokenErrorCallback( error )
			: activateSupportUser();

		user.changeUser( supportUser, supportPassword, changeUserCallback, tokenErrorCallback );
	}
}
/**
 * Logs out of support user, restoring the original user
 * @return {object} The action object
 */
export function supportUserRestore() {
	let user = new User();
	user.clear();
	user.restoreUser();
	return supportUserDeactivated();
}

/**
 * Returns an action object to signal that the support user was activated.
 *
 * @param  {Object} userData   New user's details
 * @return {Object}            Action object
 */
export function supportUserActivated( userData ) {
	userSettings.fetchSettings();

	return {
		type: SUPPORT_USER_ACTIVATED,
		userData
	};
}

/**
 * Returns an action object to signal that the support user was disabled.
 *
 * @param  {error}  error The error which caused the deactivation, if any
 * @return {Object}       Action object
 */
export function supportUserDeactivated( error ) {
	userSettings.fetchSettings();

	return {
		type: SUPPORT_USER_DEACTIVATED,
		error
	};
}
