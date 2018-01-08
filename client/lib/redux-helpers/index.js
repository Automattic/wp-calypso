/**
 * Internal dependencies
 */
import { receiveUser } from 'state/users/actions';
import { setCurrentUserId, setCurrentUserFlags } from 'state/current-user/actions';

/**
 * Sets current user id, current user id flags and adds the user to user's list
 * @param {User} user user object as recivied from currentUser.get() singleton store
 * @param {ReduxStore} store redux store, an object with dispatch method
 */
export const setCurrentUserOnReduxStore = ( user, store ) => {
	store.dispatch( receiveUser( user ) );
	store.dispatch( setCurrentUserId( user.ID ) );
	store.dispatch( setCurrentUserFlags( user.meta.data.flags.active_flags ) );
};
