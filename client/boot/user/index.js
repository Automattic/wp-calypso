/**
 * Internal dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';
import userFactory from 'lib/user';

const user = userFactory();
const listeners = [];
let unsubscribeStore;
let currentUserData = null;

window.user = user;

export function updateUserLegacy( newUserData ) {
	if ( ! newUserData ) {
		return;
	}
	currentUserData = newUserData;
	user.set( currentUserData );
	return user;
}

export function syncUserWithLegacyStore( reduxStore ) {
	updateUserLegacy( getCurrentUser( reduxStore.getState() ) );
	subscribeToUserChanges( reduxStore, updateUserLegacy );
}

export function subscribeToUserChanges( reduxStore, listener ) {
	listeners.push( listener );
	if ( ! unsubscribeStore ) {
		unsubscribeStore = reduxStore.subscribe( () => {
			const newUserData = getCurrentUser( reduxStore.getState() );
			if ( newUserData && currentUserData !== newUserData ) {
				currentUserData = newUserData;
				listeners.map( callback => callback( currentUserData ) );
			}
		} );
	}
}
