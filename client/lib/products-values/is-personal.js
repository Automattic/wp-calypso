/**
 * Internal dependencies
 */
import { isPersonalPlan } from 'calypso/lib/plans';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isPersonal( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isPersonalPlan( product.product_slug );
}
