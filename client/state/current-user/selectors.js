/**
 * Internal dependencies
 */
import { getUser } from 'state/users/selectors';

/**
 * Returns the user object for the current user.
 *
 * @param  {Object}  state  Global state tree
 * @return {?Object}        Current user
 */
export function getCurrentUser( state ) {
	if ( ! state.currentUser.id ) {
		return null;
	}

	return getUser( state, state.currentUser.id );
}
