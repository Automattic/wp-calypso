/**
 * Returns media storage information for a given site.
 * @param   {Object}  state  Global state tree
 * @param   {Number}  siteId Site ID
 * @returns {Object}         Media Storage Information
 */
export function getMediaStorage( state, siteId ) {
	return state.sites.mediaStorage.items[ siteId ];
}

/**
 * Returns true, if we're currently requesting media storage limits.
 * @param   {Object}  state  Global state tree
 * @param   {Number}  siteId Site ID
 * @returns {Boolean}        If media storage is requested
 */
export function isRequestingMediaStorage( state, siteId ) {
	return !! state.sites.mediaStorage.fetchingItems[ siteId ];
}
