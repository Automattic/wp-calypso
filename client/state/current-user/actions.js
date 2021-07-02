/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import userFactory from 'calypso/lib/user';
import {
	clearStore,
	disablePersistence,
	getStoredUserId,
	setStoredUserId,
} from 'calypso/lib/user/store';
import {
	CURRENT_USER_FETCH,
	CURRENT_USER_RECEIVE,
	CURRENT_USER_SET_EMAIL_VERIFIED,
} from 'calypso/state/action-types';
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

let fetchingUser = null;

function setLegacyUserData( userData ) {
	const user = userFactory();
	user.data = userData;
	user.emit( 'change' );
}

export function fetchCurrentUser() {
	return ( dispatch ) => {
		if ( fetchingUser ) {
			return fetchingUser;
		}

		dispatch( {
			type: CURRENT_USER_FETCH,
		} );

		fetchingUser = wpcom
			.me()
			.get( {
				meta: 'flags',
			} )
			.then( async ( user ) => {
				const userData = filterUserObject( user );

				const storedUserId = getStoredUserId();
				if ( storedUserId != null && storedUserId !== userData.ID ) {
					await clearStore();
				}

				setStoredUserId( userData.ID );
				dispatch( setCurrentUser( userData ) );

				// @TODO: Remove this once `lib/user` has been fully reduxified
				setLegacyUserData( userData );
			} )
			.catch( () => {
				// @TODO: Remove this once `lib/user` has been fully reduxified
				setLegacyUserData( false );
			} )
			.finally( () => {
				fetchingUser = null;
			} );

		return fetchingUser;
	};
}

export function redirectToLogout( postLogoutRedirectUrl ) {
	return async ( dispatch, getState ) => {
		const userData = getCurrentUser( getState() );
		const logoutUrl = getLogoutUrl( userData, postLogoutRedirectUrl );

		// Clear any data stored locally within the user data module or localStorage
		disablePersistence();
		await clearStore();

		window.location.href = logoutUrl;
	};
}

export function setUserEmailVerified( verified ) {
	return {
		type: CURRENT_USER_SET_EMAIL_VERIFIED,
		verified,
	};
}
