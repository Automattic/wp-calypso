/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
	WOOCOMMERCE_PRODUCT_UPDATED,
} from 'woocommerce/state/action-types';

export default createReducer( {}, {
	[ WOOCOMMERCE_PRODUCT_UPDATED ]: productUpdated,
	[ WOOCOMMERCE_PRODUCTS_REQUEST ]: productsRequest,
	[ WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS ]: productsRequestSuccess,
	[ WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE ]: productsRequestFailure,
} );

function productUpdated( state, action ) {
	const { product } = action;
	const products = state.products || [];
	return { ...state,
		products: updateCachedProduct( products, product ),
	};
}

function updateCachedProduct( products, product ) {
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

	return newProducts;
}

export function productsRequestSuccess( state, action ) {
	const prevState = state || {};
	const isLoading = setLoading( prevState, action.page, false );
	let products = prevState.products && [ ...prevState.products ] || [];
	action.products.forEach( function( product ) {
		products = updateCachedProduct( products, product );
	} );

	return { ...prevState,
		products,
		isLoading,
		totalPages: action.totalPages,
	};
}

export function productsRequest( state, action ) {
	const prevState = state || {};
	const isLoading = setLoading( prevState, action.page, true );
	return { ...prevState, isLoading };
}

export function productsRequestFailure( state, action ) {
	const prevState = state || {};
	const isLoading = setLoading( prevState, action.page, false );
	return { ...prevState, isLoading };
}

function setLoading( state, page, newStatus ) {
	const isLoading = state.isLoading && { ...state.isLoading } || {};
	isLoading[ page ] = newStatus;
	return isLoading;
}
