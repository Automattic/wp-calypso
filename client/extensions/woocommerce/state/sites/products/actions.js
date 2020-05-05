/**
 * External dependencies
 */
import { isArray } from 'lodash';
/**
 * Internal dependencies
 */
import { DEFAULT_QUERY, getNormalizedProductsQuery } from './utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from 'woocommerce/state/sites/request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
	WOOCOMMERCE_PRODUCT_CREATE,
	WOOCOMMERCE_PRODUCT_DELETE,
	WOOCOMMERCE_PRODUCT_DELETE_SUCCESS,
	WOOCOMMERCE_PRODUCT_REQUEST,
	WOOCOMMERCE_PRODUCT_UPDATE,
	WOOCOMMERCE_PRODUCT_UPDATED,
} from 'woocommerce/state/action-types';

/**
 * Action Creator: Create a new product
 *
 * @param {number} siteId The id of the site upon which to create the product.
 * @param {object} product The complete product object (may include a placeholder id)
 * @param {object|Function} [successAction] Action with extra props { sentData, receivedData }
 * @param {object|Function} [failureAction] Action with extra props { error }
 * @returns {object} Action object
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
 * Action Creator: Update an existing product
 *
 * @param {number} siteId The id of the site upon which to create the product.
 * @param {object} product The complete product object (must have real id)
 * @param {object|Function} [successAction] Action with extra props { sentData, receivedData }
 * @param {object|Function} [failureAction] Action with extra props { error }
 * @returns {object} Action object
 */
export function updateProduct( siteId, product, successAction, failureAction ) {
	const action = {
		type: WOOCOMMERCE_PRODUCT_UPDATE,
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
 * @param {number} siteId The id of the site to which the product belongs.
 * @param {object} data The complete product object with which to update the state.
 * @param {object} originatingAction The action which precipitated this update.
 * @returns {object} Action object
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
 * @param {number} siteId The id of the site upon which to deletethe product.
 * @param {number} productId The ID of the product to remove.
 * @param {string} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {string} [failureAction=undefined] Optional action object to be dispatched upon error.
 * @returns {object} Action object
 */
export const deleteProduct = ( siteId, productId, successAction = null, failureAction = null ) => (
	dispatch,
	getState
) => {
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

	// ?force=true deletes a product instead of trashing
	// In v1, we don't have trash management. Later we can trash instead.
	return request( siteId )
		.del( `products/${ productId }?force=true` )
		.then( ( data ) => {
			dispatch( deleteProductSuccess( siteId, data ) );
			if ( successAction ) {
				dispatch( successAction( data ) );
			}
		} )
		.catch( ( err ) => {
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

export function fetchProduct( siteId, productId, successAction, failureAction ) {
	return {
		type: WOOCOMMERCE_PRODUCT_REQUEST,
		siteId,
		productId,
		successAction,
		failureAction,
	};
}

export function fetchProducts( siteId, params, successAction, failureAction ) {
	return {
		type: WOOCOMMERCE_PRODUCTS_REQUEST,
		siteId,
		params: { ...DEFAULT_QUERY, ...params },
		successAction,
		failureAction,
	};
}

export function fetchProductsFailure( siteId, params ) {
	return {
		type: WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
		siteId,
		params,
	};
}

export function productsUpdated( siteId, params, products, totalPages, totalProducts ) {
	// This passed through the API layer successfully, but failed at the remote site.
	if ( ! isArray( products ) ) {
		return {
			type: WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
			siteId,
			params,
			error: products,
		};
	}

	const normalizedQuery = getNormalizedProductsQuery( params );
	return {
		type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
		siteId,
		params: normalizedQuery,
		totalPages,
		totalProducts,
		products,
	};
}
