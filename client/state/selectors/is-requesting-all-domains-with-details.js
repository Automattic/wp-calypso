/**
 * Determines whether the list of domains with details is being requested.
 *
 * @param {object} state - global state tree
 * @returns {?boolean} true if the list is being requested, false otherwise
 */
export default function isRequestingAllDomainsWithDetails( state ) {
	return state.sites?.domains?.isRequestingAllDomainsWithDetails || false;
}
