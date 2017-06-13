/**
 * Internal dependencies
 */
import { areProductsLoaded, areProductsLoading } from './selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from '../request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
	WOOCOMMERCE_PRODUCT_CREATE,
	WOOCOMMERCE_PRODUCT_UPDATED,
} from 'woocommerce/state/action-types';

/**
 * Action Creator: Create a new product
 *
 * @param {Number} siteId The id of the site upon which to create the product.
 * @param {Object} product The complete product object (may include a placeholder id)
 * @param {String} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {String} [errorAction=undefined] Optional action object to be dispatched upon error.
 * @return {Object} Action object
 */
export function createProduct( siteId, product, successAction = undefined, errorAction = undefined ) {
	const action = {
		type: WOOCOMMERCE_PRODUCT_CREATE,
		siteId,
		product,
	};

	if ( successAction ) {
		action.successAction = successAction;
	}

	if ( errorAction ) {
		action.errorAction = errorAction;
	}

	return action;
}

/**
 * Action Creator: Update local state that product has been updated.
 *
 * This action prompts the state to update itself after a product has been updated.
 *
 * @param {Number} siteId The id of the site to which the product belongs.
 * @param {Object} product The complete product object with which to update the state.
 * @return {Object} Action object
 */
export function productUpdated( siteId, product ) {
	return {
		type: WOOCOMMERCE_PRODUCT_UPDATED,
		siteId,
		product,
	};
}

export const fetchProducts = ( siteId, page ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	if ( areProductsLoaded( state, page, siteId ) || areProductsLoading( state, page, siteId ) ) {
		return;
	}

	const fetchAction = {
		type: WOOCOMMERCE_PRODUCTS_REQUEST,
		siteId,
		page,
	};
	dispatch( fetchAction );

	return request( siteId ).getWithHeaders( `products?page=${ page }` ).then( ( response ) => {
		const { headers, data } = response;
		const totalPages = headers[ 'X-WP-TotalPages' ];
		dispatch( {
			type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
			siteId,
			page,
			totalPages,
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
