/**
 * Internal dependencies
 */
import { isPremiumPlan } from './index';
import { formatProduct } from './format-product';

export function isPremium( product ) {
	product = formatProduct( product );

	return isPremiumPlan( product.product_slug );
}
