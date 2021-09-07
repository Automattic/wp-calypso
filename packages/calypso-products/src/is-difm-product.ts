import { WPCOM_DIFM_LITE } from './constants';
import { formatProduct } from './format-product';

export function isDIFMProduct( product: any ): boolean {
	product = formatProduct( product );

	return product.product_slug === WPCOM_DIFM_LITE;
}
