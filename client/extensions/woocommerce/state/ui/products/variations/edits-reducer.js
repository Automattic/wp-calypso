/**
 * External dependencies
 */

import { compact, find, isEqual, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import {
	WOOCOMMERCE_PRODUCT_CREATE,
	WOOCOMMERCE_PRODUCT_EDIT,
	WOOCOMMERCE_PRODUCT_UPDATED,
	WOOCOMMERCE_PRODUCT_ATTRIBUTE_EDIT,
	WOOCOMMERCE_PRODUCT_VARIATION_CREATE,
	WOOCOMMERCE_PRODUCT_VARIATION_EDIT,
	WOOCOMMERCE_PRODUCT_VARIATION_EDIT_CLEAR,
	WOOCOMMERCE_PRODUCT_VARIATION_UPDATE,
	WOOCOMMERCE_PRODUCT_VARIATION_UPDATED,
} from 'woocommerce/state/action-types';

import { editProductAttribute } from '../edits-reducer';
import { getBucket } from 'woocommerce/state/ui/helpers';
import generateVariations from 'woocommerce/lib/generate-variations';

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_PRODUCT_EDIT:
			return editProductAction( state, action );
		case WOOCOMMERCE_PRODUCT_UPDATED:
			return productUpdatedAction( state, action );
		case WOOCOMMERCE_PRODUCT_VARIATION_EDIT:
			return editProductVariationAction( state, action );
		case WOOCOMMERCE_PRODUCT_VARIATION_EDIT_CLEAR:
			return clearEditsAction( state, action );
		case WOOCOMMERCE_PRODUCT_VARIATION_UPDATED:
			return productVariationUpdatedAction( state, action );
		case WOOCOMMERCE_PRODUCT_ATTRIBUTE_EDIT:
			return editProductAttributeAction( state, action );
	}

	return state;
} );

/**
 * Updates an edits object for a specific product.
 *
 * The main edits state contains an array of edits object, one for each
 * product to be edited. The edits object for a product is in this format:
 *
 * ```
 * {
 *   productId: <number|object>,
 *   creates: [ {<new variation object>} ]
 *   updated: [ {<variation props to update>} ]
 *   deletes: [ <variation id> ]
 * }
 * ```
 *
 * @param {object} edits The state at `woocommerce.ui.products.variations.edits`
 * @param {number|object} productId The id of product edits object to be updating.
 * @param {Function} doUpdate ( productEdits ) Called with previous product edits, takes return as new product edits.
 * @returns {object} The new, updated product edits to be used in state.
 */
function updateProductEdits( edits, productId, doUpdate ) {
	const prevEdits = edits || [];
	let found = false;

	const newEdits = prevEdits.map( ( productEdits ) => {
		if ( isEqual( productId, productEdits.productId ) ) {
			found = true;
			return doUpdate( productEdits );
		}
		return productEdits;
	} );

	if ( ! found ) {
		newEdits.push( doUpdate( undefined ) );
	}

	return newEdits;
}

function editProductAction( edits, action ) {
	const { product, data, productVariations } = action;

	if ( product && 'simple' === data.type ) {
		// Ensure there are no variation edits for this product,
		// and that any existing ones have deletes.
		return updateProductEdits( edits, product.id, () => {
			const deletes = productVariations ? productVariations.map( ( v ) => v.id ) : undefined;
			return { deletes };
		} );
	}

	return edits;
}

function clearEditsAction() {
	return null;
}

function editProductVariationAction( edits, action ) {
	const { product, variation, data } = action;
	const prevEdits = edits || [];
	const productId = product.id;
	const bucket = getBucket( variation );
	let found = false;

	// Look for an existing product edits first.
	const _edits = prevEdits.map( ( productEdits ) => {
		if ( isEqual( productId, productEdits.productId ) ) {
			found = true;
			const variationId = ( variation && variation.id ) || {
				placeholder: uniqueId( 'product_variation_' ),
			};
			const _variation = variation || { id: variationId };
			const _array = editProductVariation( productEdits[ bucket ], _variation, data );
			return {
				...productEdits,
				[ bucket ]: _array,
				currentlyEditingId: variationId,
			};
		}

		return productEdits;
	} );

	if ( ! found ) {
		// product not in edits, so add it now.
		const variationId = ( variation && variation.id ) || {
			placeholder: uniqueId( 'product_variation_' ),
		};
		const _variation = variation || { id: variationId };

		const _array = editProductVariation( null, _variation, data );
		_edits.push( {
			productId,
			[ bucket ]: _array,
			currentlyEditingId: variationId,
		} );
	}

	return _edits;
}

function editProductVariation( array, variation, data ) {
	// Use the existing variation id (real or placeholder), or creates.length if no product.
	const prevArray = array || [];

	let found = false;

	// Look for this object in the appropriate create or edit array first.
	const _array = prevArray.map( ( v ) => {
		if ( isEqual( variation.id, v.id ) ) {
			found = true;
			return { ...v, ...data };
		}

		return v;
	} );

	if ( ! found ) {
		// update or create not already in edit state, so add it now.
		_array.push( { id: variation.id, ...data } );
	}

	return _array;
}

function editProductAttributeAction( edits, action ) {
	const { product, attribute, data, productVariations } = action;
	const attributes = editProductAttribute( product.attributes, attribute, data );
	const calculatedVariations = generateVariations( { ...product, attributes }, productVariations );

	return updateProductEdits( edits, product.id, ( productEdits ) => {
		const creates = productEdits ? productEdits.creates : [];
		const updates = productEdits ? productEdits.updates : [];
		const newCreates = updateVariationCreates( creates, calculatedVariations, productVariations );
		const newUpdates = updateVariationUpdates( updates, calculatedVariations, productVariations );
		const newDeletes = updateVariationDeletes( calculatedVariations, productVariations );

		return {
			...productEdits,
			productId: product.id,
			creates: newCreates,
			updates: newUpdates,
			deletes: newDeletes,
		};
	} );
}

function updateVariationCreates( creates, calculatedVariations, productVariations ) {
	const newCreates = compact(
		calculatedVariations.map( ( calculatedVariation ) => {
			const foundCreate = find( creates, { attributes: calculatedVariation.attributes } );

			if ( foundCreate ) {
				return foundCreate;
			}

			if ( ! find( productVariations, { attributes: calculatedVariation.attributes } ) ) {
				// This calculated variation doesn't exist in server data, but it should now. Create it.
				return {
					id: { placeholder: uniqueId( 'product_variation_' ) },
					attributes: calculatedVariation.attributes,
					sku: calculatedVariation.sku,
					status: 'publish',
				};
			}
		} )
	);

	return newCreates.length ? newCreates : undefined;
}

function updateVariationUpdates( updates, calculatedVariations, productVariations ) {
	const newUpdates = compact(
		calculatedVariations.map( ( calculatedVariation ) => {
			const productVariation = find( productVariations, {
				attributes: calculatedVariation.attributes,
			} );

			if ( productVariation ) {
				// If we've made it this far, it's valid to have updates on this product variation.
				return find( updates, { id: productVariation.id } );
			}
		} )
	);

	return newUpdates.length ? newUpdates : undefined;
}

function updateVariationDeletes( calculatedVariations, productVariations ) {
	if ( productVariations ) {
		const newDeletes = compact(
			productVariations.map( ( productVariation ) => {
				const foundInCalculated = find( calculatedVariations, {
					attributes: productVariation.attributes,
				} );

				if ( ! foundInCalculated ) {
					// We only delete those variations that don't show up in our calculated set.
					// Even if it was supposed to be deleted before, but now our set includes it, we
					// won't delete it.
					//
					// Note: This will not support the user deleting a variation that is valid within the
					// calculated set of variations. It can't be done this way.
					return productVariation.id;
				}
			} )
		);

		return newDeletes.length ? newDeletes : undefined;
	}
}

export function productUpdatedAction( edits, action ) {
	const { data, originatingAction } = action;

	if ( WOOCOMMERCE_PRODUCT_CREATE === originatingAction.type ) {
		const prevEdits = edits || [];
		const prevProductId = originatingAction.product.id;
		const newProductId = data.id;

		const newEdits = prevEdits.map( ( productEdits ) => {
			if ( isEqual( prevProductId, productEdits.productId ) ) {
				return { ...productEdits, productId: newProductId };
			}
			return productEdits;
		} );

		return newEdits;
	}

	return edits;
}

export function productVariationUpdatedAction( edits, action ) {
	const { originatingAction } = action;
	let bucket = null;

	bucket = WOOCOMMERCE_PRODUCT_VARIATION_CREATE === originatingAction.type ? 'creates' : bucket;
	bucket = WOOCOMMERCE_PRODUCT_VARIATION_UPDATE === originatingAction.type ? 'updates' : bucket;

	if ( bucket ) {
		const { productId } = originatingAction;
		const variationId = originatingAction.variation.id;

		return removeVariationEdit( edits, bucket, productId, variationId );
	}

	return edits;
}

function removeVariationEdit( edits, bucket, productId, variationId ) {
	const prevEdits = edits || [];

	const newEdits = compact(
		prevEdits.map( ( editsForProduct ) => {
			if ( isEqual( productId, editsForProduct.productId ) ) {
				return removeVariationEditFromEditsForProduct( editsForProduct, bucket, variationId );
			}
			return editsForProduct;
		} )
	);

	return newEdits.length ? newEdits : null;
}

function removeVariationEditFromEditsForProduct( editsForProduct, bucket, variationId ) {
	const prevBucketEdits = editsForProduct[ bucket ] || [];

	const newBucketEdits = compact(
		prevBucketEdits.map( ( variationEdit ) => {
			if ( isEqual( variationId, variationEdit.id ) ) {
				return undefined;
			}
			return variationEdit;
		} )
	);

	const newEditsForProduct = {
		...editsForProduct,
		[ bucket ]: newBucketEdits.length ? newBucketEdits : undefined,
	};

	// Only send back something if we have a remaining edit somewhere.
	if ( newEditsForProduct.creates || newEditsForProduct.updates || newEditsForProduct.deletes ) {
		return newEditsForProduct;
	}
	return undefined;
}
