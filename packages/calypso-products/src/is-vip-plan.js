/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isVipPlan( product ) {
	product = formatProduct( product );

	return 'vip' === product.product_slug;
}
