/**
 * Internal dependencies
 */
import { isEcommercePlan } from './main';
import { formatProduct } from './format-product';

export function isEcommerce( product ) {
	product = formatProduct( product );

	return isEcommercePlan( product.product_slug );
}
