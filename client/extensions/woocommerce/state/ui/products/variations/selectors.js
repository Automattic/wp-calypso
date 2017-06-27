/**
 * External dependencies
 */
import { get, find, isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getVariation } from '../../../variations/selectors';

function getVariationEditsStateForProduct( state, productId, siteId = getSelectedSiteId( state ) ) {
	const woocommerce = state.extensions.woocommerce;
	const variations = get( woocommerce, [ 'ui', 'products', siteId, 'variations', 'edits' ], [] );
	return find( variations, ( v ) => productId === v.productId );
}

/**
 * Gets the accumulated edits for a variation, if any.
 *
 * @param {Object} state Global state tree
 * @param {any} productId The id of the product (or { index: # } )
 * @param {any} variationId The id of the variation (or { index: # } )
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} The current accumulated edits
 */
export function getVariationEdits( state, productId, variationId, siteId = getSelectedSiteId( state ) ) {
	const edits = getVariationEditsStateForProduct( state, productId, siteId );
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
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} The product data merged between the fetched data and edits
 */
export function getVariationWithLocalEdits( state, productId, variationId, siteId = getSelectedSiteId( state ) ) {
	const existing = isNumber( variationId );
	const variation = existing && getVariation( state, productId, variationId );
	const variationEdits = getVariationEdits( state, productId, variationId, siteId );

	return ( variation || variationEdits ) && { ...variation, ...variationEdits } || undefined;
}

/**
 * Gets the variation being currently edited in the UI.
 *
 * @param {Object} state Global state tree
 * @param {any} productId The id of the product (or { index: # } )
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} Variation object that is merged between fetched data and edits
 */
export function getCurrentlyEditingVariation( state, productId, siteId = getSelectedSiteId( state ) ) {
	const edits = getVariationEditsStateForProduct( state, productId, siteId ) || {};
	const { currentlyEditingId } = edits;

	return getVariationWithLocalEdits( state, productId, currentlyEditingId, siteId );
}

/**
 * Gets an array of variation objects for a product, including new ones being edited in the UI.
 *
 * @param {Object} state Global state tree
 * @param {any} productId The id of the product (or { index: # } )
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} Array of variation objects.
 */
export function getProductVariationsWithLocalEdits( state, productId, siteId = getSelectedSiteId( state ) ) {
	const edits = getVariationEditsStateForProduct( state, productId, siteId );
	const creates = get( edits, 'creates', undefined );
	// TODO Merge in existing variations loaded by the API for existing products.
	return creates;
}
