/**
 * Returns true if we are requesting all sites.
 *
 * @param {Object}    state  Global state tree
 * @returns {boolean}        Request State
 */
export default function isRequestingSites( state ) {
	return !! state.sites.requestingAll;
}
