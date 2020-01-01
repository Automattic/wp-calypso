/**
 * Returns whether all sites have been fetched.
 * @param {object}    state  Global state tree
 * @return {Boolean}        Request State
 */
export default function hasAllSitesList( state ) {
	return !! state.sites.hasAllSitesList;
}
