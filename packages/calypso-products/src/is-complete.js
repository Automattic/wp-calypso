import { formatProduct } from './format-product';
import { isCompletePlan } from './main';

export function isComplete( product ) {
	product = formatProduct( product );

	return isCompletePlan( product.product_slug );
}
