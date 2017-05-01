/**
 * External dependencies
 */
import { find, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_EDIT_PRODUCT_VARIATION,
	WOOCOMMERCE_UPDATE_PRODUCT_VARIATIONS
} from '../../../action-types';
import { nextBucketIndex, getBucket } from '../../helpers';

export default createReducer( null, {
	[ WOOCOMMERCE_EDIT_PRODUCT_VARIATION ]: editProductVariationAction,
	[ WOOCOMMERCE_UPDATE_PRODUCT_VARIATIONS ]: updateProductVariationsAction,
} );

function editProductVariationAction( edits, action ) {
	const { product, variation, data } = action.payload;
	const prevEdits = edits || [];
	const productId = product.id;
	const bucket = getBucket( variation );
	let found = false;

	// Look for an existing product edits first.
	const _edits = prevEdits.map( ( productEdits ) => {
		if ( productId === productEdits.productId ) {
			found = true;
			const variationId = variation && variation.id || nextBucketIndex( productEdits[ bucket ] );
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
		const variationId = variation && variation.id || nextBucketIndex( prevEdits[ bucket ] );
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
		if ( variation.id === v.id ) {
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

function updateProductVariationsAction( edits, action ) {
	const { product, existingVariations, variations } = action.payload;

	let productEdits = null;
	const prevEdits = edits || [];
	const _edits = prevEdits.map( ( edit ) => {
		if ( product.id === edit.productId ) {
			productEdits = edit;
		}
		return edit;
	} );
	let creates = productEdits && productEdits.creates || [];

	// Add new variations that do not exist yet.
	variations.forEach( ( variation ) => {
		if (
			! find( creates, ( variationCreate ) => variationEqual( variation, variationCreate ) ) &&
			! find( existingVariations, ( existingVariation ) => variationEqual( variation, existingVariation ) )
		) {
			creates.push( { id: nextBucketIndex( creates ), attributes: variation.attributes } );
		}
	} );

	// Drop invalid variations from creates.
	creates = creates.filter( ( variationCreate ) => {
		if ( ! find( variations, ( variation ) => variationEqual( variationCreate, variation ) ) ) {
			return false;
		}
		return true;
	} );

	// TODO Delete (or mark invisible) variations that already exist but are no longer valid via the API, using existingVariations.

	if ( null === productEdits ) {
		_edits.push( {
			productId: product.id,
			creates
		} );
		return _edits;
	}

	return _edits.map( ( edit ) => {
		if ( product.id === edit.productId ) {
			return {
				...productEdits,
				creates
			};
		}
		return edit;
	} );
}

function variationEqual( variation, variation2 ) {
	const attributes = variation && variation.attributes || [];
	const attributes2 = variation2 && variation2.attributes || [];
	return isEqual( attributes, attributes2 );
}
