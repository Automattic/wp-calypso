import { JETPACK_VIDEOPRESS_PRODUCTS } from './constants';
import { formatProduct } from './format-product';

export function isJetpackVideoPress( product ) {
	product = formatProduct( product );

	return JETPACK_VIDEOPRESS_PRODUCTS.includes( product.product_slug );
}
