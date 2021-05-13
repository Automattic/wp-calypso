/**
 * Internal dependencies
 */
import { isCompletePlan } from './main';
import { formatProduct } from './format-product';

export function isComplete( product ) {
	product = formatProduct( product );

	return isCompletePlan( product.product_slug );
}
