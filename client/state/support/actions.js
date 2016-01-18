/**
 * Internal dependencies
 */
import {
	ACTIVATE_SUPPORT_USER,
	DEACTIVATE_SUPPORT_USER,
	FETCH_SUPPORT_USER_TOKEN,
	TOGGLE_SUPPORT_USER_DIALOG,
} from 'state/action-types';

import User from 'lib/user';

import userSettings from 'lib/user-settings';

/**
 * Toggles the visibility of the support user dialog
 * @return {object} The action object
 */
export function toggleSupportUserDialog() {
	return {
		type: TOGGLE_SUPPORT_USER_DIALOG
	};
}

/**
 * Requests a support user token, then dispatches the relevant actions upon response
 * 
 * @param  {string} supportUser     Support username
 * @param  {string} supportPassword Support password
 * @return {thunk}                  The action thunk
 */
export function fetchSupportUserToken( supportUser, supportPassword ) {
	return ( dispatch ) => {
		dispatch( {
			type: FETCH_SUPPORT_USER_TOKEN,
			supportUser
		} );

		if ( supportUser && supportPassword ) {
			let user = new User();

			user.clear();
			user.changeUser(
				supportUser,
				supportPassword,
				( error ) => {
					if ( error ) {
						dispatch( deactivateSupportUser( error.message ) );
					} else {
						let userData = Object.assign( {}, user.data );
						dispatch( activateSupportUser( userData ) );
					}
				},
				( tokenError ) => {
					dispatch( deactivateSupportUser( tokenError.message ) );
				}
			);
		}
	}
}
/**
 * Logs out of support user, restoring the original user
 * @return {object} The action object
 */
export function restoreSupportUser() {
	let user = new User();
	user.clear();
	user.restoreUser();
	return deactivateSupportUser();
}

/**
 * Returns an action object to signal that the support user was activated.
 *
 * @return {Object}      Action object
 */
export function activateSupportUser( userData ) {
	userSettings.fetchSettings();

	return {
		type: ACTIVATE_SUPPORT_USER,
		userData
	};
}

/**
 * Returns an action object to signal that the support user was disabled.
 *
 * @return {Object}      Action object
 */
export function deactivateSupportUser( error ) {
	userSettings.fetchSettings();

	return {
		type: DEACTIVATE_SUPPORT_USER,
		error
	};
}
