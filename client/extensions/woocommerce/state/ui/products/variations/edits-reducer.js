/**
 * External dependencies
 */
import { find, isEqual, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_EDIT_PRODUCT_VARIATION,
	WOOCOMMERCE_EDIT_PRODUCT_ATTRIBUTE,
} from 'woocommerce/state/action-types';
import { getBucket } from '../../helpers';
import { editProductAttribute } from '../edits-reducer';
import generateVariations from '../../../../lib/generate-variations';

export default createReducer( null, {
	[ WOOCOMMERCE_EDIT_PRODUCT_VARIATION ]: editProductVariationAction,
	[ WOOCOMMERCE_EDIT_PRODUCT_ATTRIBUTE ]: editProductAttributeAction,
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
			const variationId = variation && variation.id || { index: Number( uniqueId() ) };
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
		const variationId = variation && variation.id || { index: Number( uniqueId() ) };
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

function editProductAttributeAction( edits, action ) {
	const prevEdits = edits || [];
	const { product, attribute, data } = action.payload;
	const attributes = editProductAttribute( product.attributes, attribute, data );
	const variations = generateVariations( { ...product, attributes } );
	let productEdits = null;

	// Look for an existing product edits first.
	edits = prevEdits.map( ( edit ) => {
		if ( product.id === edit.productId ) {
			productEdits = edit;
		}
		return edit;
	} );

	const creates = editProductVariations( productEdits, variations );

	if ( null === productEdits ) {
		edits.push( {
			productId: product.id,
			creates
		} );
		return edits;
	}

	return edits.map( ( edit ) => {
		if ( product.id === edit.productId ) {
			return {
				...productEdits,
				creates
			};
		}
		return edit;
	} );
}

// TODO Check against a product's existing variations (retrieved from the API) and deal with those in the checks below.
function editProductVariations( productEdits, variations ) {
	const creates = productEdits && productEdits.creates || [];

	// Add new variations that do not exist yet.
	variations.forEach( ( variation ) => {
		if ( ! find( creates, ( variationCreate ) => isEqual( variation.attributes, variationCreate.attributes ) ) ) {
			creates.push( {
				id: { index: Number( uniqueId() ) },
				attributes: variation.attributes,
				visible: true,
			} );
		}
	} );

	// Remove variations that are no longer valid.
	return creates.filter( ( variationCreate ) => {
		if ( variationCreate.attributes.length &&
			! find( variations, ( variation ) => isEqual( variationCreate.attributes, variation.attributes ) ) ) {
			return false;
		}
		return true;
	} );
}
