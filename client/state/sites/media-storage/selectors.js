/** @format */
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

/**
 * Returns true, if a site is over current plan limits
 * @param   {Object}  state  Global state tree
 * @param   {Number}  siteId Site ID
 * @returns {?Boolean}       True if site is over storage limits, and null if
 *                           mediaStorage is unavailable.
 */
export function isOverMediaLimit( state, siteId ) {
	const mediaStorage = state.sites.mediaStorage.items[ siteId ];
	if ( ! mediaStorage ) {
		return null;
	}
	if ( mediaStorage.max_storage_bytes === -1 ) {
		return false;
	}
	return mediaStorage.storage_used_bytes >= mediaStorage.max_storage_bytes;
}
