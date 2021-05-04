import { formatProduct } from './format-product';
import { isEcommercePlan } from './main';

export function isEcommerce( product ) {
	product = formatProduct( product );

	return isEcommercePlan( product.product_slug );
}
