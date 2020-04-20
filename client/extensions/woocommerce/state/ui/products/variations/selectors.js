/**
 * External dependencies
 */

import { compact, get, find, isNumber, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getVariationsForProduct } from 'woocommerce/state/sites/product-variations/selectors';

export function getAllVariationEdits( state, siteId = getSelectedSiteId( state ) ) {
	const woocommerce = state.extensions.woocommerce;
	return get( woocommerce, [ 'ui', 'products', siteId, 'variations', 'edits' ], [] );
}

export function getVariationEditsStateForProduct(
	state,
	productId,
	siteId = getSelectedSiteId( state )
) {
	const variations = getAllVariationEdits( state, siteId );
	return find( variations, ( v ) => isEqual( productId, v.productId ) );
}

/**
 * Gets the accumulated edits for a variation, if any.
 *
 * @param {object} state Global state tree
 * @param {any} productId The id of the product (or { placeholder: # } )
 * @param {any} variationId The id of the variation (or { placeholder: # } )
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object} The current accumulated edits
 */
export function getVariationEdits(
	state,
	productId,
	variationId,
	siteId = getSelectedSiteId( state )
) {
	const edits = getVariationEditsStateForProduct( state, productId, siteId );
	const bucket = ( isNumber( variationId ) && 'updates' ) || 'creates';
	const array = get( edits, bucket, [] );
	return find( array, ( v ) => isEqual( variationId, v.id ) );
}

/**
 * Gets a variation with local edits overlayed on top of fetched data.
 *
 * @param {object} state Global state tree
 * @param {any} productId The id of the product (or { placeholder: # } )
 * @param {any} variationId The id of the variation (or { placeholder: # } )
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object} The product data merged between the fetched data and edits
 */
export function getVariationWithLocalEdits(
	state,
	productId,
	variationId,
	siteId = getSelectedSiteId( state )
) {
	const existing = isNumber( variationId );
	const variations = existing && getVariationsForProduct( state, productId, siteId );
	const variation = variations && variations[ variationId ];
	const variationEdits = getVariationEdits( state, productId, variationId, siteId );

	return ( ( variation || variationEdits ) && { ...variation, ...variationEdits } ) || undefined;
}

/**
 * Gets the variation being currently edited in the UI.
 *
 * @param {object} state Global state tree
 * @param {any} productId The id of the product (or { placeholder: # } )
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object} Variation object that is merged between fetched data and edits
 */
export function getCurrentlyEditingVariation(
	state,
	productId,
	siteId = getSelectedSiteId( state )
) {
	const edits = getVariationEditsStateForProduct( state, productId, siteId ) || {};
	const { currentlyEditingId } = edits;

	return getVariationWithLocalEdits( state, productId, currentlyEditingId, siteId );
}

/**
 * Gets an array of variation objects for a product, including new ones being edited in the UI.
 *
 * @param {object} state Global state tree
 * @param {any} productId The id of the product (or { placeholder: # } )
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} Array of variation objects.
 */
export function getProductVariationsWithLocalEdits(
	state,
	productId,
	siteId = getSelectedSiteId( state )
) {
	const variations = getVariationsForProduct( state, productId, siteId );
	const edits = getVariationEditsStateForProduct( state, productId, siteId );
	const creates = get( edits, 'creates', undefined );
	const updates = get( edits, 'updates', undefined );
	const deletes = get( edits, 'deletes', undefined );

	const updatedVariations = compact(
		( variations || [] ).map( ( variation ) => {
			const isDeleted = Boolean(
				find( deletes, ( deletedId ) => isEqual( variation.id, deletedId ) )
			);

			if ( isDeleted ) {
				return undefined;
			}

			const update = find( updates, { id: variation.id } );
			return { ...variation, ...update };
		} )
	);

	return creates || variations
		? [ ...( creates || [] ), ...( updatedVariations || [] ) ]
		: undefined;
}
