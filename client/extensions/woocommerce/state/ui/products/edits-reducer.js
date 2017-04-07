/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_PRODUCT,
	WOOCOMMERCE_EDIT_VARIATION_TYPE,
	WOOCOMMERCE_EDIT_VARIATION,
} from '../../action-types';

const initialState = null;

export default function edits( state = initialState, action ) {
	const handlers = {
		[ 'WOOCOMMERCE_EDIT_PRODUCT' ]: editProduct,
		[ 'WOOCOMMERCE_EDIT_VARIATION_TYPE' ]: editVariationType,
		[ 'WOOCOMMERCE_EDIT_VARIATION' ]: editVariation,
	};

	const handler = handlers[ action.type ];

	return ( handler && handler( state, action ) ) || state;
}

function editProduct( state, action ) {
	// TODO: Remove this temporary code.
	console.log( 'editProduct' );
}

function editVariationType( state, action ) {
	// TODO: Remove this temporary code.
	console.log( 'editVariationType' );
}

function editVariation( state, action ) {
	// TODO: Remove this temporary code.
	console.log( 'editVariation' );
}

