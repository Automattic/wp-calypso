/**
 * Internal dependencies
 */
import { isPersonalPlan } from 'lib/plans';
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function isPersonal( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isPersonalPlan( product.product_slug );
}
