import { filterUserObject, getLogoutUrl, rawCurrentUserFetch } from 'calypso/lib/user/shared-utils';
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
	CURRENT_USER_SET_JETPACK_PARTNER_TYPE,
} from 'calypso/state/action-types';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

/**
 * Returns an action object that sets the current user object on the store
 *
 * @param  {Object} user user object
 * @returns {Object}        Action object
 */
export function setCurrentUser( user ) {
	return {
		type: CURRENT_USER_RECEIVE,
		user,
	};
}

let fetchingUser = null;

export function fetchCurrentUser() {
	return ( dispatch ) => {
		if ( fetchingUser ) {
			return fetchingUser;
		}

		dispatch( {
			type: CURRENT_USER_FETCH,
		} );

		fetchingUser = rawCurrentUserFetch()
			.then( async ( user ) => {
				const userData = filterUserObject( user );

				const storedUserId = getStoredUserId();
				if ( storedUserId != null && storedUserId !== userData.ID ) {
					await clearStore();
				}

				setStoredUserId( userData.ID );
				dispatch( setCurrentUser( userData ) );
			} )
			.catch( () => {
				// @TODO: Improve error handling
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

export function setUserJetpackPartnerType( partnerType ) {
	return {
		type: CURRENT_USER_SET_JETPACK_PARTNER_TYPE,
		jetpack_partner_type: partnerType,
	};
}
