/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_PRODUCT_UPDATED,
} from 'woocommerce/state/action-types';

export default createReducer( {}, {
	[ WOOCOMMERCE_PRODUCT_UPDATED ]: productUpdated,
} );

function productUpdated( state, action ) {
	const { data } = action.payload;

	return updateCachedProduct( state, data );
}

function updateCachedProduct( state, product ) {
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

	return { ...state, product: newProducts };
}

