/**
 * Returns true if a network request is in progress to fetch the specified, or
 * false otherwise.
 *
 * @param  {object}           state  Global state tree
 * @param  {(number|String)}  siteId Site ID or slug
 * @return {boolean}          Whether request is in progress
 */
export default function isRequestingSite( state, siteId ) {
	return !! state.sites.requesting[ siteId ];
}
