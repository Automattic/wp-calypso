/**
 * Internal dependencies
 */
import { isBloggerPlan } from './index';
import { formatProduct } from './format-product';

export function isBlogger( product ) {
	product = formatProduct( product );

	return isBloggerPlan( product.product_slug );
}
