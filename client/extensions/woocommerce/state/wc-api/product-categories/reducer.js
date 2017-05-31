/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES,
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES ]: fetchProductCategories,
	[ WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS ]: fetchProductCategoriesSuccess,
};

function fetchProductCategories( siteData ) {
	// TODO: Update stats in the tree to show that this request is pending.
	return siteData;
}

function fetchProductCategoriesSuccess( siteData, action ) {
	const { data } = action.payload;

	return { ...siteData, productCategories: data };
}

