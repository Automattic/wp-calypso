/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { clearStore, getStoredUserId, setStoredUserId } from 'calypso/lib/user/store';
import { CURRENT_USER_FETCH, CURRENT_USER_RECEIVE } from 'calypso/state/action-types';
import { filterUserObject, getLogoutUrl } from 'calypso/lib/user/shared-utils';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

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

export function fetchCurrentUser() {
	return async ( dispatch ) => {
		dispatch( {
			type: CURRENT_USER_FETCH,
		} );

		try {
			const user = await wpcom.me().get( {
				meta: 'flags',
			} );
			const userData = filterUserObject( user );

			const storedUserId = getStoredUserId();
			if ( storedUserId != null && storedUserId !== userData.ID ) {
				await clearStore();
			}

			setStoredUserId( userData.ID );
			dispatch( setCurrentUser( userData ) );
		} catch {}
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
