/**
 * Internal dependencies
 */

import { isValidCapability } from 'calypso/state/current-user/selectors';

/**
 * Returns true if the current user has the specified capability for the site,
 * false if the user does not have the capability or if the capability
 * cannot be determined (if the site is not currently known, or if specifying
 * an invalid capability).
 *
 * @see https://codex.wordpress.org/Function_Reference/current_user_can
 *
 * @param  {object}   state      Global state tree
 * @param  {number}   siteId     Site ID
 * @param  {string}   capability Capability label
 * @returns {boolean}            Whether current user has capability
 */
export const canCurrentUser = ( state, siteId, capability ) => {
	if ( ! isValidCapability( state, siteId, capability ) ) {
		return false;
	}

	return state.currentUser.capabilities[ siteId ][ capability ];
};

export default canCurrentUser;
