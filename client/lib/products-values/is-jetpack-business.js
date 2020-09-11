/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';
import { isJetpackPlan } from 'lib/products-values/is-jetpack-plan';
import { isBusiness } from 'lib/products-values/is-business';

export function isJetpackBusiness( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isBusiness( product ) && isJetpackPlan( product );
}
