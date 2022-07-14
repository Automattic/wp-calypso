/**
 * Returns true if we are requesting site excerpts.
 *
 * @param {object}    state  Global state tree
 * @returns {boolean}        Request State
 */
export default function isRequestingSiteExcerpts( state ) {
	return !! state.sites.requestingExcerpts;
}
