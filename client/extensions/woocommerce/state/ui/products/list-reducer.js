/**
 * External dependencies
 */
import { createReducer } from 'state/utils';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PRODUCT_DELETE_SUCCESS,
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_RECEIVE,
} from 'woocommerce/state/action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_PRODUCT_DELETE_SUCCESS ]: productsDeleteSuccess,
	[ WOOCOMMERCE_PRODUCTS_REQUEST ]: productsRequest,
	[ WOOCOMMERCE_PRODUCTS_RECEIVE ]: productsReceive,
} );

export function productsReceive( state, action ) {
	if ( action.error ) {
		return state;
	}
	const prevState = state || {};
	const { page, products } = action;
	const productIds = products.map( ( p ) => {
		return p.id;
	} );
	return { ...prevState,
		currentPage: page,
		productIds,
		requestedPage: null,
	};
}

export function productsRequest( state, action ) {
	const prevState = state || {};
	const { page } = action;
	return { ...prevState,
		requestedPage: page,
	};
}

export function productsDeleteSuccess( state, action ) {
	const prevState = state || {};
	const prevProductIds = prevState.productIds || [];
	const newProductIds = prevProductIds.filter( id => id !== action.data.id );
	return { ...prevState,
		productIds: newProductIds,
	};
}
