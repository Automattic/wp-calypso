/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isJetpackPlan } from 'calypso/lib/products-values/is-jetpack-plan';
import { isBusiness } from 'calypso/lib/products-values/is-business';

export function isJetpackBusiness( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isBusiness( product ) && isJetpackPlan( product );
}
