/**
 * External dependencies
 */
import { isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_PRODUCT,
	WOOCOMMERCE_EDIT_PRODUCT_ATTRIBUTE,
} from '../../action-types';

const initialState = null;

export default function( state = initialState, action ) {
	const handlers = {
		[ WOOCOMMERCE_EDIT_PRODUCT ]: editProductAction,
		[ WOOCOMMERCE_EDIT_PRODUCT_ATTRIBUTE ]: editProductAttributeAction,
	};

	const handler = handlers[ action.type ];

	return ( handler && handler( state, action ) ) || state;
}

function editProductAction( edits, action ) {
	const { product, data } = action.payload;

	const prevEdits = edits || {};
	const bucket = product && isNumber( product.id ) && 'updates' || 'creates';
	const _array = editProduct( prevEdits[ bucket ], product, data );

	return { ...prevEdits, [ bucket ]: _array };
}

function editProductAttributeAction( edits, action ) {
	const { product, attributeIndex, data } = action.payload;
	const attributes = product && product.attributes;

	const prevEdits = edits || {};
	const bucket = product && isNumber( product.id ) && 'updates' || 'creates';
	const _attributes = editProductAttribute( attributes, attributeIndex, data );
	const _array = editProduct( prevEdits[ bucket ], product, { attributes: _attributes } );

	return { ...prevEdits, [ bucket ]: _array };
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

function editProductAttribute( attributes, attributeIndex, data ) {
	const prevAttributes = attributes || [];
	const index = ( isNumber( attributeIndex ) ? attributeIndex : prevAttributes.length );

	const _attributes = [ ...prevAttributes ];
	const prevAttribute = prevAttributes[ index ] || {};

	_attributes[ index ] = { ...prevAttribute, ...data };

	return _attributes;
}
