/**
 * External dependencies
 */
import { isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_EXISTING_PRODUCT,
	WOOCOMMERCE_EDIT_NEW_PRODUCT,
} from '../../action-types';

const initialState = null;

export default function( state = initialState, action ) {
	const handlers = {
		[ WOOCOMMERCE_EDIT_EXISTING_PRODUCT ]: editExistingProductAction,
		[ WOOCOMMERCE_EDIT_NEW_PRODUCT ]: editNewProductAction,
	};

	const handler = handlers[ action.type ];

	return ( handler && handler( state, action ) ) || state;
}

function editExistingProductAction( edits, action ) {
	const { product, data } = action.payload;

	const prevEdits = edits || {};
	const updates = editExistingProduct( prevEdits.updates, product, data );
	return { ...prevEdits, updates };
}

function editNewProductAction( edits, action ) {
	const { data, newProductIndex } = action.payload;

	const prevEdits = edits || {};
	const creates = editNewProduct( prevEdits.creates, newProductIndex, data );
	return { ...prevEdits, creates };
}

function editExistingProduct( updates, product, data ) {
	const prevUpdates = updates || [];

	let found = false;

	const _updates = prevUpdates.map( ( prevUpdate ) => {
		if ( product.id === prevUpdate.id ) {
			found = true;
			return { ...prevUpdate, ...data };
		}

		return prevUpdate;
	} );

	if ( ! found ) {
		_updates.push( { id: product.id, ...data } );
	}

	return _updates;
}

function editNewProduct( creates, newProductIndex, data ) {
	const prevCreates = creates || [];
	const index = ( isNumber( newProductIndex ) ? newProductIndex : prevCreates.length );

	const _creates = [ ...prevCreates ];
	const prevCreate = prevCreates[ index ] || {};

	_creates[ index ] = { ...prevCreate, ...data };

	return _creates;
}
