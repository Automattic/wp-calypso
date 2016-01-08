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

export function toggleSupportUserDialog( showAction ) {
	return {
		type: TOGGLE_SUPPORT_USER_DIALOG,
		showAction
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
 			let userData = Object.assign( {}, user.data );

 			user.clear();
 			user.changeUser(
 				supportUser,
 				supportPassword,
 				( error ) => dispatch( deactivateSupportUser( error.message ) )
 			);

 			dispatch( activateSupportUser( userData ) );
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
	return {
		type: DEACTIVATE_SUPPORT_USER,
		error
	};
}
