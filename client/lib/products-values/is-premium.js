/**
 * Internal dependencies
 */
import { isPremiumPlan } from 'calypso/lib/plans';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isPremium( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isPremiumPlan( product.product_slug );
}
