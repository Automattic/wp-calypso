/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_PRODUCT_CATEGORIES_GET,
	WOOCOMMERCE_API_PRODUCT_CATEGORIES_GET_SUCCESS,
} from '../../action-types';

export default {
	[ WOOCOMMERCE_API_PRODUCT_CATEGORIES_GET ]: productCategoriesGet,
	[ WOOCOMMERCE_API_PRODUCT_CATEGORIES_GET_SUCCESS ]: productCategoriesGetSuccess,
};

function productCategoriesGet( siteData ) {
	// TODO: Update stats in the tree to show that this request is pending.
	return siteData;
}

function productCategoriesGetSuccess( siteData, action ) {
	const { data } = action.payload;

	return { ...siteData, productCategories: data };
}

