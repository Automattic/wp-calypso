/**
 * External dependencies
 */
import { uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_PRODUCT,
	WOOCOMMERCE_EDIT_PRODUCT_ATTRIBUTE,
} from '../../action-types';
import { nextBucketIndex, getBucket } from '../helpers';

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
	const bucket = getBucket( product );
	const _product = product || { id: nextBucketIndex( prevEdits[ bucket ] ) };
	const _array = editProduct( prevEdits[ bucket ], _product, data );

	return {
		...prevEdits,
		[ bucket ]: _array,
		currentlyEditingId: _product.id,
	};
}

function editProductAttributeAction( edits, action ) {
	const { product, attribute, data } = action.payload;
	const attributes = product && product.attributes;

	const prevEdits = edits || {};
	const bucket = getBucket( product );
	const _attributes = editProductAttribute( attributes, attribute, data );
	const _product = product || { id: nextBucketIndex( prevEdits[ bucket ] ) };
	const _array = editProduct( prevEdits[ bucket ], _product, { attributes: _attributes } );

	return {
		...prevEdits,
		[ bucket ]: _array,
		currentlyEditingId: _product.id,
	};
}

function editProduct( array, product, data ) {
	// Use the existing product id (real or placeholder), or creates.length if no product.
	const prevArray = array || [];

	let found = false;

	// Look for this object in the appropriate create or edit array first.
	const _array = prevArray.map( ( p ) => {
		if ( product.id === p.id ) {
			found = true;
			return { ...p, ...data };
		}

		return p;
	} );

	if ( ! found ) {
		// update or create not already in edit state, so add it now.
		_array.push( { id: product.id, ...data } );
	}

	return _array;
}

function editProductAttribute( attributes, attribute, data ) {
	const prevAttributes = attributes || [];
	const uid = attribute && attribute.uid || uniqueId( 'edit_' ) + ( new Date().getTime() );

	let found = false;

	// Look for this attribute in the array of attributes first.
	const _attributes = prevAttributes.map( ( a ) => {
		if ( uid === a.uid ) {
			found = true;
			return { ...a, ...data };
		}

		return a;
	} );

	if ( ! found ) {
		// Attribute has not yet been edited, so add it now.
		_attributes.push( { ...data, uid } );
	}

	return _attributes;
}
