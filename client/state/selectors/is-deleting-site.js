/** @format */
/**
 * Returns true if a network request is in progress to delete the specified site, or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether deletion is in progress
 */
export default function isDeletingSite( state, siteId ) {
	return !! state.sites.deleting[ siteId ];
}
