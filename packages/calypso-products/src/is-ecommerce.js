/**
 * Internal dependencies
 */
import { isEcommercePlan } from './index';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isEcommerce( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isEcommercePlan( product.product_slug );
}
