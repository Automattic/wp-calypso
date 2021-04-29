/**
 * Internal dependencies
 */
import { isBusinessPlan } from './main';
import { formatProduct } from './format-product';

export function isBusiness( product ) {
	product = formatProduct( product );

	return isBusinessPlan( product.product_slug );
}
