import { formatProduct } from './format-product';

export function isDIFMProduct( product: any ): boolean {
	product = formatProduct( product );

	return product.product_slug === 'wp_difm_lite';
}
