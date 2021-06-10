/**
 * Internal dependencies
 */
import userLibrary from 'calypso/lib/user';
import { CURRENT_USER_CLEAR, CURRENT_USER_RECEIVE } from 'calypso/state/action-types';
import { clearStore } from 'calypso/lib/user/store';

/**
 * Returns an action object that sets the current user object on the store
 *
 * @param  {object} user user object
 * @returns {object}        Action object
 */
export function setCurrentUser( user ) {
	return {
		type: CURRENT_USER_RECEIVE,
		user,
	};
}

/**
 * Returns an action object that clears the current user object from the store
 *
 * @returns {object}        Action object
 */
export function clearCurrentUser() {
	return async ( dispatch ) => {
		// @TODO: Remove once `lib/user` has fully been reduxified
		userLibrary().data = false;

		/**
		 * Clear internal user data and empty localStorage cache
		 * to discard any user reference that the application may hold
		 */
		await clearStore();

		dispatch( {
			type: CURRENT_USER_CLEAR,
		} );
	};
}
