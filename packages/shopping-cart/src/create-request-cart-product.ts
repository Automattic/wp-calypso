/**
 * Internal dependencies
 */
import type { RequestCartProduct, MinimalRequestCartProduct } from './shopping-cart-endpoint';

export default function createRequestCartProduct(
	properties: MinimalRequestCartProduct
): RequestCartProduct {
	if ( ! properties.product_slug || ! properties.product_id ) {
		throw new Error( 'Both product_slug and product_id are required for request cart products' );
	}
	return {
		meta: '',
		volume: 1,
		quantity: null,
		extra: {},
		...properties,
	};
}

export function createRequestCartProducts(
	products: MinimalRequestCartProduct[]
): RequestCartProduct[] {
	return products.map( createRequestCartProduct );
}
