/**
 * Internal dependencies
 */

import canCurrentUser from 'calypso/state/selectors/can-current-user';

/**
 * Returns an object with a key/property for each site ID in the sites list.
 * Each property returns true if the current user has the specified capability for the site,
 * false if the user does not have the capability, or null if the capability
 * cannot be determined (if the site is not currently known, or if specifying
 * an invalid capability).
 *
 * @param  {object}   state      Global state tree
 * @param  {Array}   siteIds     List of site IDs
 * @param  {string}   capability Capability label
 * @returns {object}            Object map, keyed per site by current user capability
 */
export const canCurrentUserForSites = ( state, siteIds, capability ) => {
	return siteIds.reduce( ( map, siteId ) => {
		map[ siteId ] = canCurrentUser( state, siteId, capability );
		return map;
	}, {} );
};

export default canCurrentUserForSites;
