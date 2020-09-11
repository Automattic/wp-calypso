/**
 * Internal dependencies
 */
import { isEcommercePlan } from 'lib/plans';
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function isEcommerce( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isEcommercePlan( product.product_slug );
}
