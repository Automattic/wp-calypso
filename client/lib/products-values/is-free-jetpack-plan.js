/**
 * Internal dependencies
 */
import { PLAN_JETPACK_FREE } from 'calypso/lib/plans/constants';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isFreeJetpackPlan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === PLAN_JETPACK_FREE;
}
