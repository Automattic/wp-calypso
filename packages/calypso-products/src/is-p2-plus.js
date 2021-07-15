import { formatProduct } from './format-product';
import { isP2PlusPlan } from './main';

export function isP2Plus( product ) {
	product = formatProduct( product );

	return isP2PlusPlan( product.product_slug );
}
