import { formatProduct } from './format-product';
import { isSecurityDailyPlan } from './main';

export function isSecurityDaily( product ) {
	product = formatProduct( product );

	return isSecurityDailyPlan( product.product_slug );
}
