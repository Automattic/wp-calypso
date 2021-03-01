/**
 * External dependencies
 */
import { find, flatten, map } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSerializedProductsQuery } from './utils';

function getRawProducts( state, siteId ) {
	return state?.extensions?.woocommerce?.sites[ siteId ]?.products.products;
}

function getQuery( state, siteId, key ) {
	return state?.extensions?.woocommerce?.sites[ siteId ]?.products.queries?.[ key ];
}

export function getProduct( state, productId, siteId = getSelectedSiteId( state ) ) {
	const allProducts = getRawProducts( state, siteId );
	return find( allProducts, { id: productId } );
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array}  The entire list of products for this site
 */
export function getAllProducts( state, siteId = getSelectedSiteId( state ) ) {
	const allProducts = getRawProducts( state, siteId );
	return allProducts !== undefined ? allProducts : [];
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array}  The entire list of products for this site with variations inline as "products"
 */
export function getAllProductsWithVariations( state, siteId = getSelectedSiteId( state ) ) {
	const products = getRawProducts( state, siteId ) ?? [];
	const variations = state?.extensions?.woocommerce?.sites[ siteId ]?.productVariations ?? {};
	// Flatten variations from their productId mapping down into a single array
	const variationsList = flatten(
		map( variations, ( items, productId ) => {
			return items.map( ( item ) => ( { ...item, productId: Number( productId ) } ) );
		} )
	);

	return [ ...products, ...variationsList ];
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [params] Params given to API request. Defaults to { page: 1, per_page: 10 }
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the products list for a requested page has been successfully loaded from the server
 */
export function areProductsLoaded( state, params = {}, siteId = getSelectedSiteId( state ) ) {
	const key = getSerializedProductsQuery( params );
	// Strict check because it could also be undefined.
	return getQuery( state, siteId, key )?.isLoading === false;
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [params] Params given to API request. Defaults to { page: 1, per_page: 10 }
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the products list for a request page is currently being retrieved from the server
 */
export function areProductsLoading( state, params = {}, siteId = getSelectedSiteId( state ) ) {
	const key = getSerializedProductsQuery( params );
	// Strict check because it could also be undefined.
	return getQuery( state, siteId, key )?.isLoading === true;
}

/**
 * @param {object} state Whole Redux state tree
 * @param {object} [params] Query used to fetch products. Can contain page, search, etc. If not provided,
 *                          defaults to first page, all products
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array|boolean} List of products, or false if there was an error
 */
export function getProducts( state, params = {}, siteId = getSelectedSiteId( state ) ) {
	if ( ! areProductsLoaded( state, params, siteId ) ) {
		return [];
	}
	const key = getSerializedProductsQuery( params );
	const products = getRawProducts( state, siteId ) ?? [];
	const productIdsOnPage = getQuery( state, siteId, key )?.ids ?? [];

	if ( productIdsOnPage.length ) {
		return productIdsOnPage.map( ( id ) => find( products, { id } ) );
	}
	return false;
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [params] Params given to API request. Defaults to { page: 1, per_page: 10 }
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number} Total number of pages of products available on a site, or 0 if not loaded yet.
 */
export function getTotalProductsPages( state, params = {}, siteId = getSelectedSiteId( state ) ) {
	const key = getSerializedProductsQuery( params );
	return getQuery( state, siteId, key )?.totalPages ?? 0;
}

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [params] Params given to API request. Defaults to { page: 1, per_page: 10 }
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {number} Total number of products available on a site, or 0 if not loaded yet.
 */
export function getTotalProducts( state, params = {}, siteId = getSelectedSiteId( state ) ) {
	const key = getSerializedProductsQuery( params );
	return getQuery( state, siteId, key )?.totalProducts ?? 0;
}
