/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_PRODUCT_DELETE_SUCCESS,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCT_UPDATED,
} from 'woocommerce/state/action-types';

export default createReducer(
	{},
	{
		[ WOOCOMMERCE_PRODUCT_DELETE_SUCCESS ]: productsDeleteSuccess,
		[ WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS ]: productsRequestSuccess,
		[ WOOCOMMERCE_PRODUCT_UPDATED ]: productUpdated,
	}
);

export function productUpdated( products, action ) {
	const { data: product } = action;

	return {
		...products,
		[ product.id ]: product,
	};
}

export function productsRequestSuccess( products, action ) {
	const newProducts = action.products.reduce( ( obj, product ) => {
		obj[ product.id ] = product;
		return obj;
	}, {} );

	return {
		...products,
		...newProducts,
	};
}

export function productsDeleteSuccess( products, action ) {
	const id = action.data.id;

	// eslint-disable-next-line no-unused-vars
	const { [ id ]: deletedProduct, ...remainingProducts } = products;

	return remainingProducts;
}
