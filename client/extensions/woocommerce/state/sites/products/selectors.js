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
 * @param {Number} [page] Page of products. If not provided, defaults to first page.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the products list for a requested page has been successfully loaded from the server
 */
export const areProductsLoaded = ( state, page = 1, siteId = getSelectedSiteId( state ) ) => {
	const isLoading = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'products', 'isLoading', page ] );
	// Strict check because it could also be undefined.
	return ( false === isLoading );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [page] Page of products. If not provided, defaults to first page.
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the products list for a request page is currently being retrieved from the server
 */
export const areProductsLoading = ( state, page = 1, siteId = getSelectedSiteId( state ) ) => {
	const isLoading = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'products', 'isLoading', page ] );
	// Strict check because it could also be undefined.
	return ( true === isLoading );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} Total number of pages of products available on a site, or 0 if not loaded yet.
 */
export const getTotalProductsPages = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'products', 'totalPages' ], 0 );
};
