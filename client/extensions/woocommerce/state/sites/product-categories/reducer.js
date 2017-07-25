/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING, ERROR } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
} from 'woocommerce/state/action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST ]: productCategoriesRequest,
	[ WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED ]: productCategoryUpdated,
} );

function productCategoriesRequest( state, action ) {
	const { data, error } = get( action, [ 'meta', 'dataLayer' ], {} );

	if ( error ) {
		return ERROR;
	}
	if ( data ) {
		return data.data;
	}
	return LOADING;
}

function productCategoryUpdated( state, action ) {
	const { data } = action;
	const productCategories = ( state !== LOADING ? state : [] );
	return updateCachedProductCategory( productCategories, data );
}

function updateCachedProductCategory( productCategories, category ) {
	let found = false;
	const newCategories = productCategories.map( ( c ) => {
		if ( c.id === category.id ) {
			found = true;
			return category;
		}
		return c;
	} );

	if ( ! found ) {
		newCategories.push( category );
	}
	return newCategories;
}

