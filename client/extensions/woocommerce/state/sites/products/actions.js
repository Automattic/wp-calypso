import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import {
	areProductsLoading,
	areProductSearchResultsLoading,
	getProductSearchQuery,
} from './selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from '../request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
	WOOCOMMERCE_PRODUCTS_SEARCH_CLEAR,
	WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST,
	WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_FAILURE,
	WOOCOMMERCE_PRODUCT_CREATE,
	WOOCOMMERCE_PRODUCT_DELETE,
	WOOCOMMERCE_PRODUCT_DELETE_SUCCESS,
	WOOCOMMERCE_PRODUCT_UPDATED,
} from 'woocommerce/state/action-types';

/**
 * Action Creator: Create a new product
 *
 * @param {Number} siteId The id of the site upon which to create the product.
 * @param {Object} product The complete product object (may include a placeholder id)
 * @param {String} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {String} [failureAction=undefined] Optional action object to be dispatched upon error.
 * @return {Object} Action object
 */
export function createProduct( siteId, product, successAction, failureAction ) {
	const action = {
		type: WOOCOMMERCE_PRODUCT_CREATE,
		siteId,
		product,
		successAction,
		failureAction,
	};

	return action;
}

/**
 * Action Creator: Update local state that product has been updated.
 *
 * This action prompts the state to update itself after a product has been updated.
 *
 * @param {Number} siteId The id of the site to which the product belongs.
 * @param {Object} data The complete product object with which to update the state.
 * @return {Object} Action object
 */
export function productUpdated( siteId, data, originatingAction ) {
	return {
		type: WOOCOMMERCE_PRODUCT_UPDATED,
		siteId,
		data,
		originatingAction,
	};
}

/**
 * Action Creator: Delete a product.
 * TODO: For v1, since we have no bulk edit, we will delete directly. When we implement bulk
 * trashing/deleting, we can use the Product UI edit state to store deletes off this action type.
 *
 * @param {Number} siteId The id of the site upon which to deletethe product.
 * @param {Number} productId The ID of the product to remove.
 * @param {String} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {String} [failureAction=undefined] Optional action object to be dispatched upon error.
 * @return {Object} Action object
 */
export const deleteProduct = (
	siteId,
	productId,
	successAction = null,
	failureAction = null,
) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	const deleteAction = {
		type: WOOCOMMERCE_PRODUCT_DELETE,
		siteId,
		productId,
	};

	dispatch( deleteAction );

	return request( siteId ).del( `products/${ productId }` )
		.then( ( data ) => {
			dispatch( deleteProductSuccess( siteId, data ) );
			if ( successAction ) {
				dispatch( successAction( data ) );
			}
		} )
		.catch( err => {
			dispatch( setError( siteId, deleteAction, err ) );
			if ( failureAction ) {
				dispatch( failureAction( err ) );
			}
		} );
};

function deleteProductSuccess( siteId, data ) {
	return {
		type: WOOCOMMERCE_PRODUCT_DELETE_SUCCESS,
		siteId,
		data,
	};
}

export const fetchProducts = ( siteId, page ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	if ( areProductsLoading( state, page, siteId ) ) {
		return;
	}

	const fetchAction = {
		type: WOOCOMMERCE_PRODUCTS_REQUEST,
		siteId,
		page,
	};
	dispatch( fetchAction );

	return request( siteId ).getWithHeaders( `products?page=${ page }&per_page=10` ).then( ( response ) => {
		const { headers, data } = response;
		const totalPages = headers[ 'X-WP-TotalPages' ];
		const totalProducts = headers[ 'X-WP-Total' ];
		dispatch( {
			type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
			siteId,
			page,
			totalPages,
			totalProducts,
			products: data,
		} );
	} ).catch( error => {
		dispatch( setError( siteId, fetchAction, error ) );
		dispatch( {
			type: WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
			siteId,
			page,
			error,
		} );
	} );
};

export const fetchProductSearchResults = ( siteId, page, query ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	if ( ! query ) {
		if ( areProductSearchResultsLoading( state, page, siteId ) ) {
			return;
		}
		query = getProductSearchQuery( state, siteId );
	}

	const queryForURL = encodeURIComponent( trim( query ) );
	const fetchAction = {
		type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST,
		siteId,
		query,
		page,
	};
	dispatch( fetchAction );

	return request( siteId ).getWithHeaders( `products?page=${ page }&per_page=10&search=${ queryForURL }` ).then( ( response ) => {
		const { headers, data } = response;
		const totalProducts = headers[ 'X-WP-Total' ];
		dispatch( {
			type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
			siteId,
			query,
			page,
			totalProducts,
			products: data,
		} );
	} ).catch( error => {
		dispatch( setError( siteId, fetchAction, error ) );
		dispatch( {
			type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_FAILURE,
			siteId,
			query,
			page,
			error,
		} );
	} );
};

export function clearProductSearch( siteId ) {
	return {
		type: WOOCOMMERCE_PRODUCTS_SEARCH_CLEAR,
		siteId,
	};
}
