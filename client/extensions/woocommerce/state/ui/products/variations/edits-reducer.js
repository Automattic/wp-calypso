/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_PRODUCT_VARIATION,
} from '../../../action-types';
import { nextBucketIndex, getBucket } from '../../helpers';

const initialState = null;

export default function( state = initialState, action ) {
	const handlers = {
		[ WOOCOMMERCE_EDIT_PRODUCT_VARIATION ]: editProductVariationAction,
	};

	const handler = handlers[ action.type ];

	return ( handler && handler( state, action ) ) || state;
}

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
