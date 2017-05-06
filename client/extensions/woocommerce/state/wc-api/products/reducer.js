/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_CREATE_PRODUCT,
	WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS,
} from '../../action-types';

export default {
	[ WOOCOMMERCE_API_CREATE_PRODUCT ]: createProduct,
	[ WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS ]: createProductSuccess,
};

function createProduct( siteData ) {
	// TODO: Update state to show pending status.
	return siteData;
}

function createProductSuccess( siteData, action ) {
	const { data } = action.payload;

	console.log( 'createProductSuccess! data=', data );

	return siteData;
}


