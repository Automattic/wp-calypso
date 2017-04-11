/**
 * External dependencies
 */
import { isNumber } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_EXISTING_PRODUCT_VARIATION_TYPE,
	WOOCOMMERCE_EDIT_NEW_PRODUCT_VARIATION_TYPE,
	WOOCOMMERCE_EDIT_PRODUCT,
} from '../../action-types';

const debug = debugFactory( 'woocommerce:state:ui:products' );

const initialState = null;

export default function( state = initialState, action ) {
	const handlers = {
		[ WOOCOMMERCE_EDIT_EXISTING_PRODUCT_VARIATION_TYPE ]: editExistingProductVariationTypeAction,
		[ WOOCOMMERCE_EDIT_NEW_PRODUCT_VARIATION_TYPE ]: editNewProductVariationTypeAction,
		[ WOOCOMMERCE_EDIT_PRODUCT ]: editProductAction,
	};

	const handler = handlers[ action.type ];

	return ( handler && handler( state, action ) ) || state;
}

function editProductAction( edits, action ) {
	const { product, data } = action.payload;

	const prevEdits = edits || {};
	const bucket = product && isNumber( product.id ) && 'updates' || 'creates';
	const array = editProduct( prevEdits[ bucket ], product, data );

	return { ...prevEdits, [ bucket ]: array };
}

function editProduct( array, product, data ) {
	// Use the existing product id (real or placeholder), or creates.length if no product.
	const prevArray = array || [];
	const productId = ( product ? product.id : { index: prevArray.length } );

	let found = false;

	// Look for this object in the appropriate create or edit array first.
	const _array = prevArray.map( ( p ) => {
		if ( productId === p.id ) {
			found = true;
			return { ...p, ...data };
		}

		return p;
	} );

	if ( ! found ) {
		// update or create not already in edit state, so add it now.
		_array.push( { id: productId, ...data } );
	}

	return _array;
}

function editExistingProductVariationTypeAction( edits, action ) {
	const { product, attributeIndex, data } = action.payload;
	const attributes = product && product.attributes;

	const _attributes = editProductVariationType( attributes, attributeIndex, data );

	const prevEdits = edits || {};
	const updates = editExistingProduct( prevEdits.updates, product, { attributes: _attributes } );
	return { ...prevEdits, updates };
}

function editNewProductVariationTypeAction( edits, action ) {
	const { newProductIndex, product, attributeIndex, data } = action.payload;
	const attributes = product && product.attributes;

	const _attributes = editProductVariationType( attributes, attributeIndex, data );

	const prevEdits = edits || {};
	const creates = editNewProduct( prevEdits.creates, newProductIndex, { attributes: _attributes } );
	return { ...prevEdits, creates };
}

function editProductVariationType( attributes, attributeIndex, data ) {
	const prevAttributes = attributes || [];
	const index = ( isNumber( attributeIndex ) ? attributeIndex : prevAttributes.length );

	const _attributes = [ ...prevAttributes ];
	const prevAttribute = prevAttributes[ index ] || { variation: true, options: [] };

	if ( prevAttribute.variation ) {
		_attributes[ index ] = { ...prevAttribute, ...data };
	} else {
		debug( 'WARNING: Attempting to edit a non-variation attribute as a variation type.' );
	}

	return _attributes;
}
