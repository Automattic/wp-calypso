/**
 * Internal dependencies
 */
import { PLAN_HOST_BUNDLE } from './index';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isJpphpBundle( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_HOST_BUNDLE;
}
