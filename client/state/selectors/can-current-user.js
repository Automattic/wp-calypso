/**
 * Internal dependencies
 */
import { isValidCapability } from 'state/current-user/selectors';

/**
 * Returns true if the current user has the specified capability for the site,
 * false if the user does not have the capability, or null if the capability
 * cannot be determined (if the site is not currently known, or if specifying
 * an invalid capability).
 *
 * @see https://codex.wordpress.org/Function_Reference/current_user_can
 *
 * @param  {Object}   state      Global state tree
 * @param  {Number}   siteId     Site ID
 * @param  {String}   capability Capability label
 * @return {?Boolean}            Whether current user has capability
 */
export default function canCurrentUser( state, siteId, capability ) {
	if ( ! isValidCapability( state, siteId, capability ) ) {
		return null;
	}

	return state.currentUser.capabilities[ siteId ][ capability ];
}
