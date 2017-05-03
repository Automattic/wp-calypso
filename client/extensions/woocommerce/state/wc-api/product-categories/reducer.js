/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES,
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS,
} from '../../action-types';

export default {
	[ WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES ]: productCategoriesGet,
	[ WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS ]: productCategoriesGetSuccess,
};

function productCategoriesGet( siteData ) {
	// TODO: Update stats in the tree to show that this request is pending.
	return siteData;
}

function productCategoriesGetSuccess( siteData, action ) {
	const { data } = action.payload;

	return { ...siteData, productCategories: data };
}

