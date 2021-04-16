/**
 * Internal dependencies
 */
import { isPremiumPlan } from '@automattic/calypso-products';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isPremium( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isPremiumPlan( product.product_slug );
}
