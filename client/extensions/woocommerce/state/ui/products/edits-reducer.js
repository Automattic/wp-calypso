/**
 * External dependencies
 */
import { isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_PRODUCT,
} from '../../action-types';

const initialState = null;

export default function( state = initialState, action ) {
	const handlers = {
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

