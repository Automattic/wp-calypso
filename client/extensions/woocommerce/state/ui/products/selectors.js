/** @format */

/**
 * External dependencies
 */

import { get, find, isEqual, isObject } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getProduct } from 'woocommerce/state/sites/products/selectors';

export function getAllProductEdits( state, siteId ) {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'products', siteId, 'edits' ], {} );
}

/**
 * Gets the accumulated edits for a product, if any.
 *
 * @param {Object} state Global state tree
 * @param {any} productId The id of the product (or { placeholder: # } )
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} The current accumulated edits
 */
export function getProductEdits( state, productId, siteId = getSelectedSiteId( state ) ) {
	const edits = getAllProductEdits( state, siteId );
	const bucket = isObject( productId ) ? 'creates' : 'updates';
	const array = get( edits, bucket, [] );

	return find( array, p => isEqual( productId, p.id ) );
}

/**
 * Gets a product with local edits overlaid on top of fetched data.
 *
 * @param {Object} state Global state tree
 * @param {any} productId The id of the product (or { placeholder: # } )
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} The product data merged between the fetched data and edits
 */
export function getProductWithLocalEdits( state, productId, siteId = getSelectedSiteId( state ) ) {
	const existing = ! isObject( productId );

	const product = existing && getProduct( state, productId );
	const productEdits = getProductEdits( state, productId, siteId );

	return ( ( product || productEdits ) && { ...product, ...productEdits } ) || undefined;
}

/**
 * Gets the id of the currently editing product.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number|Object} Id of the currently editing product.
 */
export function getCurrentlyEditingId( state, siteId = getSelectedSiteId( state ) ) {
	const edits = getAllProductEdits( state, siteId ) || {};
	const { currentlyEditingId } = edits;

	return currentlyEditingId;
}

/**
 * Gets the product being currently edited in the UI.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} Product object that is merged between fetched data and edits
 */
export function getCurrentlyEditingProduct( state, siteId = getSelectedSiteId( state ) ) {
	const currentlyEditingId = getCurrentlyEditingId( state, siteId );

	return getProductWithLocalEdits( state, currentlyEditingId, siteId );
}

/**
 * Gets the current products list page being viewed.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Number} Current product list page (defaul: 1)
 */
export function getProductsCurrentPage( state, siteId = getSelectedSiteId( state ) ) {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'products', siteId, 'list', 'currentPage' ],
		1
	);
}

/**
 * Gets the current products list search term being viewed (if exists).
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {String} Current product list search term (defaul: '')
 */
export function getProductsCurrentSearch( state, siteId = getSelectedSiteId( state ) ) {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'products', siteId, 'list', 'currentSearch' ],
		''
	);
}

/**
 * Gets the requested/loading page for the products list.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {number|null} Requested product list page
 */
export function getProductsRequestedPage( state, siteId = getSelectedSiteId( state ) ) {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'products', siteId, 'list', 'requestedPage' ],
		null
	);
}

/**
 * Gets the requested/loading search term for the products list.
 *
 * @param {Object} state Global state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {String|null} Requested product list term
 */
export function getProductsRequestedSearch( state, siteId = getSelectedSiteId( state ) ) {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'products', siteId, 'list', 'requestedSearch' ],
		null
	);
}
