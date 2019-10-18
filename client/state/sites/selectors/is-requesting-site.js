/**
 * Returns true if a network request is in progress to fetch the specified, or
 * false otherwise.
 *
 * @param  {Object}           state  Global state tree
 * @param  {(Number|String)}  siteId Site ID or slug
 * @return {Boolean}          Whether request is in progress
 */
export default function isRequestingSite( state, siteId ) {
	return !! state.sites.requesting[ siteId ];
}
