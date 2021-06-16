/**
 * Internal dependencies
 */
import { CURRENT_USER_RECEIVE } from 'calypso/state/action-types';
import { clearStore } from 'calypso/lib/user/store';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getLogoutUrl } from 'calypso/lib/user/shared-utils';

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

export function redirectToLogout( postLogoutRedirectUrl ) {
	return async ( dispatch, getState ) => {
		const userData = getCurrentUser( getState() );
		const logoutUrl = getLogoutUrl( userData, postLogoutRedirectUrl );

		// Clear any data stored locally within the user data module or localStorage
		await clearStore();

		window.location.href = logoutUrl;
	};
}
