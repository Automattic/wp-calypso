/**
 * Internal dependencies
 */
import { getUser } from 'state/users/selectors';

/**
 * Returns the site object for the currently selected site.
 *
 * @param  {Object} state  Global state tree
 * @return {Object}        Selected site
 */
export function getSelectedSite( state ) {
	if ( ! state.ui.selectedSite ) {
		return null;
	}

	return state.sites.items[ state.ui.selectedSite ];
}

/**
 * Returns the user object for the current user.
 *
 * @param  {Object}  state  Global state tree
 * @return {?Object}        Current user
 */
export function getCurrentUser( state ) {
	if ( ! state.ui.currentUserId ) {
		return null;
	}

	return getUser( state, state.ui.currentUserId );
}
