/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

function getCustomerSearchStatus( state, siteId, searchTerm ) {
	return state?.extensions?.woocommerce?.sites[ siteId ]?.customers.isSearching[ searchTerm ];
}

/**
 * @param {object} state Whole Redux state tree
 * @param {string} searchTerm Search term to check
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the search results for a given term have been successfully loaded from the server.
 */
export function isCustomerSearchLoaded( state, searchTerm, siteId = getSelectedSiteId( state ) ) {
	// Strict check because it could also be undefined.
	return getCustomerSearchStatus( state, siteId, searchTerm ) === false;
}

/**
 * @param {object} state Whole Redux state tree
 * @param {string} searchTerm Search term to check
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the search results for a given term are currently being retrieved from the server.
 */
export function isCustomerSearchLoading( state, searchTerm, siteId = getSelectedSiteId( state ) ) {
	// Strict check because it could also be undefined.
	return getCustomerSearchStatus( state, siteId, searchTerm ) === true;
}

/**
 * @param {object} state Whole Redux state tree
 * @param {string} searchTerm Search term to check
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} List of customer results matching term
 */
export function getCustomerSearchResults( state, searchTerm, siteId = getSelectedSiteId( state ) ) {
	if ( ! isCustomerSearchLoaded( state, searchTerm, siteId ) ) {
		return [];
	}

	const customers = state?.extensions?.woocommerce?.sites?.[ siteId ]?.customers.items ?? {};
	const customerIdsForTerm =
		state?.extensions?.woocommerce?.sites[ siteId ]?.customers.queries[ searchTerm ] ?? [];
	return customerIdsForTerm
		.map( ( id ) => customers[ id ] || false )
		.filter( ( customer ) => !! customer );
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} customerId Customer ID to get
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object|boolean} a customer object as stored in the API, false if not found
 */
export function getCustomer( state, customerId, siteId = getSelectedSiteId( state ) ) {
	return state?.extensions?.woocommerce?.sites[ siteId ]?.customers.items[ customerId ] ?? false;
}
