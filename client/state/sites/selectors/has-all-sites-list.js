/**
 * Returns whether all sites have been fetched.
 * @param {Object}    state  Global state tree
 * @return {Boolean}        Request State
 */
export default function hasAllSitesList( state ) {
	return !! state.sites.hasAllSitesList;
}
