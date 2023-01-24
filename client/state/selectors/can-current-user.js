/**
 * Returns:
 * - `true` if the current user has the specified capability for the site;
 * - `false` if the user does not have the capability, or if specifying an invalid capability;
 * - `null` if the capability cannot be determined (the site is not currently known)
 *
 * @see https://codex.wordpress.org/Function_Reference/current_user_can
 * @param  {Object}   state      Global state tree
 * @param  {number|undefined}   siteId     Site ID
 * @param  {string}   capability Capability label
 * @returns {boolean}            Whether current user has capability
 */
export function canCurrentUser( state, siteId, capability ) {
	const capabilities = state.currentUser.capabilities[ siteId ];
	if ( ! capabilities ) {
		return null;
	}

	return capabilities[ capability ] || false;
}
