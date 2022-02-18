import type { RequestCartProduct, MinimalRequestCartProduct } from './types';

export default function createRequestCartProduct(
	properties: MinimalRequestCartProduct
): RequestCartProduct {
	if ( ! properties.product_slug ) {
		throw new Error( 'product_slug is required for request cart products' );
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
