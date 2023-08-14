import type { RequestCartProduct, MinimalRequestCartProduct } from './types';

export default function createRequestCartProduct(
	properties: MinimalRequestCartProduct
): RequestCartProduct {
	if ( ! properties.product_slug || properties.product_slug === 'undefined' ) {
		throw new Error( 'A product_slug is required when adding a product to the cart.' );
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
