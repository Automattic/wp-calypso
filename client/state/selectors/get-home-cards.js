/**
 * Returns the Home cards for a given site.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId The ID of the site we're querying
 * @returns {object} Object with list of cards for each region
 */
export function getHomeCards( state, siteId ) {
	return state.home?.[ siteId ]?.cards ?? null;
}
