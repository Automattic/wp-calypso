/** @format */

/**
 * External dependencies
 */
import { omitBy } from 'lodash';
import qs from 'querystring';

/**
 * Internal dependencies
 */

import { dispatchWithProps } from 'woocommerce/state/helpers';
import { post } from 'woocommerce/state/data-layer/request/actions';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import { productCategoryUpdated } from 'woocommerce/state/sites/product-categories/actions';
import {
	WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { DEFAULT_QUERY } from 'woocommerce/state/sites/product-categories/utils';
import request from 'woocommerce/state/sites/http-request';

// @TODO Move these handlers to product-categories/handlers.js

export function handleProductCategoryCreate( store, action ) {
	const { siteId, category, successAction, failureAction } = action;

	// Filter out any id we might have.
	const { id, ...categoryData } = category;

	if ( 'number' === typeof id ) {
		store.dispatch(
			setError( siteId, action, {
				message: 'Attempting to create a product category which already has a valid id.',
				category,
			} )
		);
		return;
	}

	const updatedAction = ( dispatch, getState, { data } ) => {
		dispatch( productCategoryUpdated( siteId, data, action ) );

		const props = { sentData: action.category, receivedData: data };
		dispatchWithProps( dispatch, getState, successAction, props );
	};

	store.dispatch(
		post( siteId, 'products/categories', categoryData, updatedAction, failureAction )
	);
}

export function handleProductCategoriesRequest( { dispatch }, action ) {
	const { siteId, query } = action;
	const requestQuery = { ...DEFAULT_QUERY, ...query };
	const queryString = qs.stringify( omitBy( requestQuery, val => '' === val ) );

	dispatch( request( siteId, action ).getWithHeaders( `products/categories?${ queryString }` ) );
}

export function handleProductCategoriesSuccess( { dispatch }, action, { data } ) {
	const { siteId, query } = action;
	const { headers, body, status } = data;

	// handleProductCategoriesRequest uses &_envelope
	// ( https://developer.wordpress.org/rest-api/using-the-rest-api/global-parameters/#_envelope )
	// so that we can get the X-WP-Total header back from the end-site. This means we will always get a 200
	// status back, and the real status of the request will be stored in the response. This checks the real status.
	if ( status !== 200 || ! isValidCategoriesArray( body ) ) {
		dispatch( {
			type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
			siteId,
			error: 'Invalid Categories Array',
			query,
		} );
		dispatch( setError( siteId, action, { message: 'Invalid Categories Array', body } ) );
		return;
	}

	const total = headers[ 'X-WP-Total' ];

	dispatch( {
		type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
		siteId,
		data: body,
		total,
		query,
	} );
}

export function handleProductCategoriesError( { dispatch }, action, error ) {
	const { siteId, query } = action;

	dispatch( {
		type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_FAILURE,
		siteId,
		error,
		query,
	} );

	dispatch( setError( siteId, action, error ) );
}

function isValidCategoriesArray( categories ) {
	for ( let i = 0; i < categories.length; i++ ) {
		if ( ! isValidProductCategory( categories[ i ] ) ) {
			// Short-circuit the loop and return now.
			return false;
		}
	}
	return true;
}

function isValidProductCategory( category ) {
	return (
		category &&
		category.id &&
		'number' === typeof category.id &&
		category.name &&
		'string' === typeof category.name &&
		category.slug &&
		'string' === typeof category.slug
	);
}

export default {
	[ WOOCOMMERCE_PRODUCT_CATEGORY_CREATE ]: [ handleProductCategoryCreate ],
	[ WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST ]: [
		dispatchRequest(
			handleProductCategoriesRequest,
			handleProductCategoriesSuccess,
			handleProductCategoriesError
		),
	],
};
