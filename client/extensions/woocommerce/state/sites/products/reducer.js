/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_API_CREATE_PRODUCT,
	WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS,
} from 'woocommerce/state/action-types';

export default createReducer( {}, {
	[ WOOCOMMERCE_API_CREATE_PRODUCT ]: createProduct,
	[ WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS ]: createProductSuccess,
} );

function createProduct( state ) {
	// TODO: Update state to show pending status.
	return state;
}

function createProductSuccess( state, action ) {
	const { product } = action;
	const products = state.products || [];

	let found = false;
	const newProducts = products.map( ( p ) => {
		if ( p.id === product.id ) {
			found = true;
			return product;
		}
		return p;
	} );

	if ( ! found ) {
		newProducts.push( product );
	}

	return state;
}
