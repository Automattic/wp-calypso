import { formatProduct } from './format-product';
import { isBusinessPlan } from './main';

export function isBusiness( product ) {
	product = formatProduct( product );

	return isBusinessPlan( product.product_slug );
}
