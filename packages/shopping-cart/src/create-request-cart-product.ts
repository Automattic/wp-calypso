import type { RequestCartProduct, MinimalRequestCartProduct } from './types';

export default function createRequestCartProduct(
	properties: MinimalRequestCartProduct
): RequestCartProduct {
	if ( ! properties.product_slug && ! properties.extra?.purchaseId ) {
		throw new Error(
			'product_slug or extra.purchaseId are required to create request cart products'
		);
	}
	const { product_slug, product_id, meta, volume, quantity, extra } = properties;
	if ( extra?.purchaseId && ! extra.purchaseType ) {
		extra.purchaseType = 'renewal';
	}
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
