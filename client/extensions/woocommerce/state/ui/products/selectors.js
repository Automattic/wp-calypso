/**
 * External dependencies
 */
import { get, find, isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getProduct } from '../../products/selectors';

export function getAllProductEdits( state, siteId ) {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'products', siteId, 'edits' ], {} );
}

/**
 * Gets the accumulated edits for a product, if any.
 *
 * @param {Object} state Global state tree
 * @param {any} productId The id of the product (or { index: # } )
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} The current accumulated edits
 */
export function getProductEdits( state, productId, siteId = getSelectedSiteId( state ) ) {
	const edits = getAllProductEdits( state, siteId );
	const bucket = isNumber( productId ) && 'updates' || 'creates';
	const array = get( edits, bucket, [] );

	return find( array, ( p ) => productId === p.id );
}

/**
 * Gets a product with local edits overlayed on top of fetched data.
 *
 * @param {Object} state Global state tree
 * @param {any} productId The id of the product (or { index: # } )
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} The product data merged between the fetched data and edits
 */
export function getProductWithLocalEdits( state, productId, siteId = getSelectedSiteId( state ) ) {
	const existing = isNumber( productId );

	const product = existing && getProduct( state, productId );
	const productEdits = getProductEdits( state, productId, siteId );

	return ( product || productEdits ) && { ...product, ...productEdits } || undefined;
}

/**
 * Gets the product being currently edited in the UI.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} Product object that is merged between fetched data and edits
 */
export function getCurrentlyEditingProduct( state, siteId = getSelectedSiteId( state ) ) {
	const edits = getAllProductEdits( state, siteId ) || {};
	const { currentlyEditingId } = edits;

	return getProductWithLocalEdits( state, currentlyEditingId, siteId );
}

/**
 * Gets the current products list page being viewed.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} Current product list page (defaul: 1)
 */
export function getProductListCurrentPage( state, siteId = getSelectedSiteId( state ) ) {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'products', siteId, 'list', 'currentPage' ], 1 );
}

/**
 * Gets an array of products for the current page being viewed.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {array|false} Array of products or false if products are not available.
 */
export function getProductListProducts( state, siteId = getSelectedSiteId( state ) ) {
	const products = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'products', 'products' ], {} );
	const productIds = get( state, [ 'extensions', 'woocommerce', 'ui', 'products', siteId, 'list', 'productIds' ], [] );
	if ( productIds.length ) {
		return productIds.map( id => find( products, ( p ) => id === p.id ) );
	}
	return false;
}

/**
 * Gets the requested/loading page for the products list.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {number|null} Requested product list page
 */
export function getProductListRequestedPage( state, siteId = getSelectedSiteId( state ) ) {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'products', siteId, 'list', 'requestedPage' ], null );
}

/**
 * Gets the current product search page being viewed.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} Current product search page (default: 1)
 */
export function getProductSearchCurrentPage( state, siteId = getSelectedSiteId( state ) ) {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'products', siteId, 'search', 'currentPage' ], 1 );
}

/**
 * Gets an array of products for the current search page being viewed.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {array|false} Array of products or false if products are not available.
 */
export function getProductSearchResults( state, siteId = getSelectedSiteId( state ) ) {
	const products = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'products', 'products' ], {} );
	const productIds = get( state, [ 'extensions', 'woocommerce', 'ui', 'products', siteId, 'search', 'productIds' ], [] );
	if ( productIds.length ) {
		return productIds.map( id => find( products, ( p ) => id === p.id ) );
	}
	return false;
}

/**
 * Gets the requested page for products search.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {number|null} Requested product search page
 */
export function getProductSearchRequestedPage( state, siteId = getSelectedSiteId( state ) ) {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'products', siteId, 'search', 'requestedPage' ], null );
}
