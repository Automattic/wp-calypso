/**
 * Returns true if we are requesting all sites.
 * @param {object}    state  Global state tree
 * @return {Boolean}        Request State
 */
export default function isRequestingSites( state ) {
	return !! state.sites.requestingAll;
}
