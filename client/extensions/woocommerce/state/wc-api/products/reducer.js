/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_CREATE_PRODUCT,
	WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_API_CREATE_PRODUCT ]: createProduct,
	[ WOOCOMMERCE_API_CREATE_PRODUCT_SUCCESS ]: createProductSuccess,
};

function createProduct( siteData ) {
	// TODO: Update state to show pending status.
	return siteData;
}

function createProductSuccess( siteData, action ) {
	const { product } = action.payload;
	const products = siteData.products || [];

	let found = false;
	const newProducts = products.map( ( p ) => {
		if ( p.id === product.id ) {
			found = true;
			return product;
		}
		return p;
	} );

	if ( ! found ) {
		newProducts.push( product );
	}

	return siteData;
}

