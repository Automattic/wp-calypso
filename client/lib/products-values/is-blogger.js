/**
 * Internal dependencies
 */
import { isBloggerPlan } from 'lib/plans';
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function isBlogger( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isBloggerPlan( product.product_slug );
}
