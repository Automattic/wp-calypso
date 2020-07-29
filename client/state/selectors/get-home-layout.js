/**
 * Returns the Home layout for a given site.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId The ID of the site we're querying
 * @returns {object} Object with list of cards for each region
 */
export function getHomeLayout( state, siteId ) {
	// return state.home?.sites?.[ siteId ]?.layout ?? null;
	const layout = state.home?.sites?.[ siteId ]?.layout ?? null;
	if ( layout ) {
		layout.primary.unshift('home-task-finish-store-setup');
	}
	return layout;
}
