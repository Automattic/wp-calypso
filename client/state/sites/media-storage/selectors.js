/**
 * Returns media storage information for a given site.
 *
 * @param {number}  siteId Site ID
 * @returns {object}         Media Storage Information
 */

export function getMediaStorage( state, siteId ) {
	return state.sites.mediaStorage.items[ siteId ];
}

/**
 * Returns true, if we're currently requesting media storage limits.
 *
 * @param   {object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @returns {boolean}        If media storage is requested
 */
export function isRequestingMediaStorage( state, siteId ) {
	return !! state.sites.mediaStorage.fetchingItems[ siteId ];
}

/**
 * Returns true, if a site is over current plan limits
 *
 * @param   {object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @returns {?boolean}       True if site is over storage limits, and null if
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
