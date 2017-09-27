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
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_PRODUCT_DELETE_SUCCESS ]: productsDeleteSuccess,
	[ WOOCOMMERCE_PRODUCTS_REQUEST ]: productsRequest,
	[ WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS ]: productsRequestSuccess,
} );

export function productsRequestSuccess( state, action ) {
	const prevState = state || {};
	const { params, products } = action;
	const page = params.page || null;
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
	const { params } = action;
	const page = params.page || null;
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
