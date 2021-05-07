/**
 * Internal dependencies
 */
import { isSecurityRealTimePlan } from './main';
import { formatProduct } from './format-product';

export function isSecurityRealTime( product ) {
	product = formatProduct( product );

	return isSecurityRealTimePlan( product.product_slug );
}
