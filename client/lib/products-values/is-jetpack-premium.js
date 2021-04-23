/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isJetpackPlan } from 'calypso/lib/products-values/is-jetpack-plan';
import { isPremium } from 'calypso/lib/products-values/is-premium';

export function isJetpackPremium( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isPremium( product ) && isJetpackPlan( product );
}
