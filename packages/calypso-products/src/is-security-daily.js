/**
 * Internal dependencies
 */
import { isSecurityDailyPlan } from './main';
import { formatProduct } from './format-product';

export function isSecurityDaily( product ) {
	product = formatProduct( product );

	return isSecurityDailyPlan( product.product_slug );
}
