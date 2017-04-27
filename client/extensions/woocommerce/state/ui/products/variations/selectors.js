/**
 * External dependencies
 */
import { get, find, isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import { getVariation } from '../../../variations/selectors';

function getVariationEditsStateForProduct( state, productId ) {
	const woocommerce = state.extensions.woocommerce;
	const variations = get( woocommerce, 'ui.products.variations.edits', [] );
	return find( variations, ( v ) => productId === v.productId );
}

/**
 * Gets the accumulated edits for a variation, if any.
 *
 * @param {Object} state Global state tree
 * @param {any} productId The id of the product (or { index: # } )
 * @param {any} variationId The id of the variation (or { index: # } )
 * @return {Object} The current accumulated edits
 */
export function getVariationEdits( state, productId, variationId ) {
	const edits = getVariationEditsStateForProduct( state, productId );
	const bucket = isNumber( variationId ) && 'updates' || 'creates';
	const array = get( edits, bucket, [] );
	return find( array, ( v ) => variationId === v.id );
}

/**
 * Gets a variation with local edits overlayed on top of fetched data.
 *
 * @param {Object} state Global state tree
 * @param {any} productId The id of the product (or { index: # } )
 * @param {any} variationId The id of the variation (or { index: # } )
 * @return {Object} The product data merged between the fetched data and edits
 */
export function getVariationWithLocalEdits( state, productId, variationId ) {
	const existing = isNumber( variationId );
	const variation = existing && getVariation( state, productId, variationId );
	const variationEdits = getVariationEdits( state, productId, variationId );

	return ( variation || variationEdits ) && { ...variation, ...variationEdits } || undefined;
}

/**
 * Gets the variation being currently edited in the UI.
 *
 * @param {Object} state Global state tree
 * @param {any} productId The id of the product (or { index: # } )
 * @return {Object} Variation object that is merged between fetched data and edits
 */
export function getCurrentlyEditingVariation( state, productId ) {
	const edits = getVariationEditsStateForProduct( state, productId ) || {};
	const { currentlyEditingId } = edits;

	return getVariationWithLocalEdits( state, productId, currentlyEditingId );
}
