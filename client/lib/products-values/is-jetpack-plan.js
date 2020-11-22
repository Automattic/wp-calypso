/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isJetpackPlanSlug } from 'calypso/lib/products-values/is-jetpack-plan-slug';

export function isJetpackPlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackPlanSlug( product.product_slug );
}
