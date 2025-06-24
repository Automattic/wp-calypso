/**
 * Returns whether all visible sites have been fetched.
 *
 * Visible means excluding deleted sites etc.
 * @param {Object}    state  Global state tree
 * @returns {boolean}        Request State
 */
export default function hasAllSitesList( state ) {
	return !! state.sites.hasAllSitesList;
}
