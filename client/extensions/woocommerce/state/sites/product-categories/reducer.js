/** @format */
/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export default createReducer(
	{},
	{
		[ WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST ]: () => {
			return LOADING;
		},

		[ WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS ]: ( state, { data } ) => {
			return data;
		},

		[ WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED ]: productCategoryUpdated,
	}
);

function productCategoryUpdated( state, action ) {
	const { data } = action;
	const productCategories = state !== LOADING ? state : [];
	return updateCachedProductCategory( productCategories, data );
}

function updateCachedProductCategory( productCategories, category ) {
	let found = false;
	const newCategories = productCategories.map( c => {
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
