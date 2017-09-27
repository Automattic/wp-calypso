/**
 * External dependencies
 */
import { get, find } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

export const getProduct = ( state, productId, siteId = getSelectedSiteId( state ) ) => {
	const allProducts = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'products', 'products' ] );
	return find( allProducts, { id: productId } );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [params] Params given to API request. Defaults to { page: 1, per_page: 10 }
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the products list for a requested page has been successfully loaded from the server
 */
export const areProductsLoaded = ( state, params = { page: 1, per_page: 10 }, siteId = getSelectedSiteId( state ) ) => {
	const key = JSON.stringify( params );
	const isLoadingKey = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'products', 'isLoading', key ] );
	// Strict check because it could also be undefined.
	return ( false === isLoadingKey );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [params] Params given to API request. Defaults to { page: 1, per_page: 10 }
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the products list for a request page is currently being retrieved from the server
 */
export const areProductsLoading = ( state, params = { page: 1, per_page: 10 }, siteId = getSelectedSiteId( state ) ) => {
	const key = JSON.stringify( params );
	const isLoadingKey = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'products', 'isLoading', key ] );
	// Strict check because it could also be undefined.
	return ( true === isLoadingKey );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} Total number of pages of products available on a site, or 0 if not loaded yet.
 */
export const getTotalProductsPages = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'products', 'totalPages' ], 0 );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} Total number of products available on a site, or 0 if not loaded yet.
 */
export const getTotalProducts = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'products', 'totalProducts' ], 0 );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [params] Params given to API request. Defaults to { page: 1, per_page: 10 }
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the products search results have been successfully loaded from the server
 */
export const areProductSearchResultsLoaded = ( state, params = { page: 1, per_page: 10 }, siteId = getSelectedSiteId( state ) ) => {
	const key = JSON.stringify( params );
	const isLoadingKey = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'products', 'search', 'isLoading', key ] );
	// Strict check because it could also be undefined.
	return ( false === isLoadingKey );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [params] Params given to API request. Defaults to { page: 1, per_page: 10 }
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {boolean} Whether the product search results are currently being retrieved from the server
 */
export const areProductSearchResultsLoading = ( state, params = { page: 1, per_page: 10 }, siteId = getSelectedSiteId( state ) ) => {
	const key = JSON.stringify( params );
	const isLoadingKey = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'products', 'search', 'isLoading', key ] );
	// Strict check because it could also be undefined.
	return ( true === isLoadingKey );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} Total number of products available for a search, or 0 if not loaded yet.
 */
export const getTotalProductSearchResults = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'products', 'search', 'totalProducts' ], 0 );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {string|null} Query for a search or null if no search is active.
 */
export const getProductSearchQuery = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'products', 'search', 'query' ], null );
};
