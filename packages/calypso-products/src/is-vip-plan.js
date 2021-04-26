/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isVipPlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'vip' === product.product_slug;
}
