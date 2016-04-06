/**
 * Internal dependencies
 */
import { getUser } from 'state/users/selectors';

export function getCurrentUserId( state ) {
	return state.currentUser.id;
}

/**
 * Returns the user object for the current user.
 *
 * @param  {Object}  state  Global state tree
 * @return {?Object}        Current user
 */
export function getCurrentUser( state ) {
	const userId = getCurrentUserId( state );
	if ( ! userId ) {
		return null;
	}

	return getUser( state, userId );
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
