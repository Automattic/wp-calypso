/**
 * Internal dependencies
 */
import { isPersonalPlan } from './index';
import { formatProduct } from './format-product';

export function isPersonal( product ) {
	product = formatProduct( product );

	return isPersonalPlan( product.product_slug );
}
