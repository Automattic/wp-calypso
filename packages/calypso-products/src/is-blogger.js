import { formatProduct } from './format-product';
import { isBloggerPlan } from './main';

export function isBlogger( product ) {
	product = formatProduct( product );

	return isBloggerPlan( product.product_slug );
}
