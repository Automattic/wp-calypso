/**
 * External dependencies
 */
import { reject } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_PRODUCT_DELETE_SUCCESS,
	WOOCOMMERCE_PRODUCTS_RECEIVE,
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCT_UPDATED,
	WOOCOMMERCE_PRODUCTS_SEARCH_CLEAR,
	WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST,
	WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';

export default createReducer( {}, {
	[ WOOCOMMERCE_PRODUCT_DELETE_SUCCESS ]: productsDeleteSuccess,
	[ WOOCOMMERCE_PRODUCT_UPDATED ]: productUpdated,
	[ WOOCOMMERCE_PRODUCTS_REQUEST ]: productsRequest,
	[ WOOCOMMERCE_PRODUCTS_RECEIVE ]: productsReceive,
	[ WOOCOMMERCE_PRODUCTS_SEARCH_CLEAR ]: productsSearchClear,
	[ WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST ]: productsSearchRequest,
	[ WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS ]: productsSearchRequestSuccess,
	[ WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_FAILURE ]: productsSearchRequestFailure,
} );

function productUpdated( state, action ) {
	const { data } = action;
	const products = state.products || [];
	return { ...state,
		products: updateCachedProduct( products, data ),
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

export function productsReceive( state, action ) {
	const prevState = state || {};
	const isLoading = setLoading( prevState, action.page, false );

	if ( action.error ) {
		const isError = setError( prevState, action.page, true );
		return { ...prevState, isLoading, isError };
	}

	let products = prevState.products && [ ...prevState.products ] || [];
	action.products.forEach( function( product ) {
		products = updateCachedProduct( products, product );
	} );

	const isError = setError( prevState, action.page, false );

	return { ...prevState,
		products,
		isLoading,
		isError,
		totalPages: action.totalPages,
		totalProducts: action.totalProducts,
	};
}

export function productsDeleteSuccess( state, action ) {
	const prevState = state || {};
	const prevProducts = prevState.products || [];
	const newProducts = reject( prevProducts, { id: action.data.id } );
	return { ...prevState,
		products: newProducts,
	};
}

export function productsRequest( state, { page, meta: { dataLayer: { error, data } } } ) {
	if ( data || error ) {
		return state;
	}
	const prevState = state || {};
	const isLoading = setLoading( prevState, page, true );
	return { ...prevState, isLoading };
}

export function productsSearchRequest( state, action ) {
	const prevState = state || {};
	const prevSearch = prevState.search || {};
	const isLoading = setLoading( prevSearch, action.page, true );
	return { ...prevState, search: { ...prevSearch, isLoading, query: action.query } };
}

export function productsSearchRequestFailure( state, action ) {
	const prevState = state || {};
	const prevSearch = prevState.search || {};
	const isLoading = setLoading( prevSearch, action.page, false );
	return { ...prevState, search: { ...prevSearch, isLoading, query: action.query } };
}

export function productsSearchRequestSuccess( state, action ) {
	const prevState = state || {};
	const prevSearch = prevState.search || {};
	const isLoading = setLoading( prevSearch, action.page, false );

	let products = prevState.products && [ ...prevState.products ] || [];
	action.products.forEach( function( product ) {
		products = updateCachedProduct( products, product );
	} );

	return { ...prevState,
		products,
		search: { ...prevSearch,
			isLoading,
			query: action.query,
			totalProducts: action.totalProducts,
		}
	};
}

export function productsSearchClear( state ) {
	const prevState = state || {};
	return { ...prevState,
		search: {},
	};
}

function setLoading( state, page, newStatus ) {
	const isLoading = state.isLoading && { ...state.isLoading } || {};
	isLoading[ page ] = newStatus;
	return isLoading;
}

function setError( state, page, newStatus ) {
	const isError = state.isError && { ...state.isError } || {};
	isError[ page ] = newStatus;
	return isError;
}
