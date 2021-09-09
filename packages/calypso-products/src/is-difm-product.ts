import { WPCOM_DIFM_LITE } from './constants';
import { formatProduct } from './format-product';

export function isDIFMProduct( product: { product_slug?: string; productSlug?: string } ): boolean {
	product = formatProduct( product );

	return product.product_slug === WPCOM_DIFM_LITE;
}
