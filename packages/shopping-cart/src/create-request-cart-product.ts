import type { RequestCartProduct, MinimalRequestCartProduct } from './types';

export default function createRequestCartProduct(
	properties: MinimalRequestCartProduct
): RequestCartProduct {
	if ( ! properties.product_slug ) {
		throw new Error( 'product_slug is required for request cart products' );
	}
	const { product_slug, product_id, meta, volume, quantity, extra } = properties;
	return {
		product_slug,
		product_id,
		meta: meta ?? '',
		volume: volume ?? 1,
		quantity: quantity ?? null,
		extra: extra ?? {},
	};
}

export function createRequestCartProducts(
	products: MinimalRequestCartProduct[]
): RequestCartProduct[] {
	return products.map( createRequestCartProduct );
}
