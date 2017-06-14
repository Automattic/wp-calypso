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
