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
		dispatch( {
			type: SUPPORT_USER_FETCH_TOKEN,
			supportUser
		} );

		if ( supportUser && supportPassword ) {
			let user = new User();

			user.changeUser(
				supportUser,
				supportPassword,
				( error ) => {
					if ( error ) {
						dispatch( supportUserDeactivated( error.message ) );
					} else {
						let userData = Object.assign( {}, user.data );
						dispatch( supportUserActivated( userData ) );
					}
				},
				( tokenError ) => {
					dispatch( supportUserDeactivated( tokenError.message ) );
				}
			);
		}
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
 * @return {Object}      Action object
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
 * @return {Object}      Action object
 */
export function supportUserDeactivated( error ) {
	userSettings.fetchSettings();

	return {
		type: SUPPORT_USER_DEACTIVATED,
		error
	};
}
