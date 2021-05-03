import { formatProduct } from './format-product';
import { isSecurityRealTimePlan } from './main';

export function isSecurityRealTime( product ) {
	product = formatProduct( product );

	return isSecurityRealTimePlan( product.product_slug );
}
