/**
 * External dependencies
 */
import { get, find, isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import { getProduct } from '../../products/selectors';

function getEditsState( state ) {
	const woocommerce = state.extensions.woocommerce;
	return get( woocommerce, 'ui.products.edits', {} );
}

/**
 * Gets the accumulated edits for a product, if any.
 *
 * @param {Object} state Global state tree
 * @param {any} productId The id of the product (or { index: # } )
 * @return {Object} The current accumulated edits
 */
export function getProductEdits( state, productId ) {
	const edits = getEditsState( state );
	const bucket = isNumber( productId ) && 'updates' || 'creates';
	const array = get( edits, bucket, [] );

	return find( array, ( p ) => productId === p.id );
}

/**
 * Gets a product with local edits overlayed on top of fetched data.
 *
 * @param {Object} state Global state tree
 * @param {any} productId The id of the product (or { index: # } )
 * @return {Object} The product data merged between the fetched data and edits
 */
export function getProductWithLocalEdits( state, productId ) {
	const existing = isNumber( productId );

	const product = existing && getProduct( state, productId );
	const productEdits = getProductEdits( state, productId );

	return ( product || productEdits ) && { ...product, ...productEdits } || undefined;
}

/**
 * Gets the product being currently edited in the UI.
 *
 * @param {Object} state Global state tree
 * @return {Object} Product object that is merged between fetched data and edits
 */
export function getCurrentlyEditingProduct( state ) {
	const edits = getEditsState( state ) || {};
	const { currentlyEditingId } = edits;

	return getProductWithLocalEdits( state, currentlyEditingId );
}
