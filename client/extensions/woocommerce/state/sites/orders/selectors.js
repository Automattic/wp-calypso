/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [page] Page of orders. If not provided, defaults to first page.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the orders list has been successfully loaded from the server
 */
export const areOrdersLoaded = ( state, page = 1, siteId = getSelectedSiteId( state ) ) => {
	const isLoading = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'isLoading', page ] );
	// Strict check because it could also be undefined.
	return ( false === isLoading );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [page] Page of orders. If not provided, defaults to first page.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the orders list is currently being retrieved from the server
 */
export const areOrdersLoading = ( state, page = 1, siteId = getSelectedSiteId( state ) ) => {
	const isLoading = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'isLoading', page ] );
	// Strict check because it could also be undefined.
	return ( true === isLoading );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [page] Page of orders. If not provided, defaults to first page.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {array|false} List of orders, or false if there was an error
 */
export const getOrders = ( state, page = 1, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areOrdersLoaded( state, page, siteId ) ) {
		return [];
	}

	const orders = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'items' ], {} );
	const orderIdsOnPage = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'pages', page ], [] );
	if ( orderIdsOnPage.length ) {
		return orderIdsOnPage.map( id => orders[ id ] );
	}
	return false;
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} Total number of pages of orders available on a site, or 1 if not loaded yet.
 */
export const getTotalOrdersPages = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'totalPages' ], 1 );
};
