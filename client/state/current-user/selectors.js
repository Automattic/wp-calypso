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

/**
 * Returns the locale slug for the current user.
 *
 * @param  {Object}  state  Global state tree
 * @return {?String}        Current user locale
 */
export function getCurrentUserLocale( state ) {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return null;
	}

	return user.localeSlug || null;
}
