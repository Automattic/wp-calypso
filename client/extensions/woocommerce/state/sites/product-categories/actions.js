/** @format */
/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED,
} from 'woocommerce/state/action-types';

export function fetchProductCategories( siteId ) {
	return dispatch => {
		const getAction = {
			type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
			siteId,
		};

		dispatch( getAction );

		const jpPath = `/jetpack-blogs/${ siteId }/rest-api/`;
		const apiPath = '/wc/v3/products/categories';

		// TODO: Modify this to use the extensions data layer.
		return wp.req
			.get( { path: jpPath }, { path: apiPath } )
			.then( ( { data } ) => {
				dispatch( fetchProductCategoriesSuccess( siteId, data ) );
			} )
			.catch( err => {
				dispatch( setError( siteId, getAction, err ) );
			} );
	};
}

export function fetchProductCategoriesSuccess( siteId, data ) {
	if ( ! isValidCategoriesArray( data ) ) {
		const originalAction = {
			type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
			siteId,
		};

		return setError( siteId, originalAction, { message: 'Invalid Categories Array', data } );
	}

	return {
		type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
		siteId,
		data,
	};
}

/**
 * Action Creator: Create a new product category.
 *
 * @param {Number} siteId The id of the site upon which to create.
 * @param {Object} category The product category object (may include a placeholder id).
 * @param {Object|Function} [successAction] action with extra props { sentData, receivedData }
 * @param {Object|Function} [failureAction] action with extra props { error }
 * @return {Object} Action object
 */
export function createProductCategory( siteId, category, successAction, failureAction ) {
	// TODO: Error action if not valid?

	const action = {
		type: WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
		siteId,
		category,
		successAction,
		failureAction,
	};

	return action;
}

/**
 * Action Creator: This action prompts the state to update itself after a product category has changed.
 *
 * @param {Number} siteId The id of the site to which the category belongs.
 * @param {Object} data The complete product category object with which to update the state.
 * @param {Object} originatingAction The action that precipitated this update.
 * @return {Object} Action object
 */
export function productCategoryUpdated( siteId, data, originatingAction ) {
	return {
		type: WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED,
		siteId,
		data,
		originatingAction,
	};
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
