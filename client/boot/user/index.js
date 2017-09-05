/**
 * External dependencies
 */
import config from 'config';
import store from 'store';

/**
 * Internal dependencies
 */
import { receiveUser, requestUser } from 'state/users/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import userFactory from 'lib/user';

const user = userFactory();

let currentUserData = null;

export const getUserFromCache = reduxStore => {
	let userData;

	if ( config.isEnabled( 'wpcom-user-bootstrap' ) ) {
		userData = window.currentUser || false;
		reduxStore.dispatch( receiveUser( userData ) );
	} else {
		userData = store.get( 'wpcom_user' ) || false;
		reduxStore.dispatch( requestUser() );
	}

	if ( userData ) {
		currentUserData = userData;
		user.set( userData );
	}

	return user;
};

export const subscribeToUserChanges = ( reduxStore, listener ) => {
	reduxStore.subscribe( () => {
		const newUserData = getCurrentUser( reduxStore.getState() );

		if ( newUserData && currentUserData !== newUserData ) {
			currentUserData = newUserData;
			user.set( currentUserData );
			listener( user );
		}
	} );
};
