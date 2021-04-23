/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { isJetpackPlan } from './is-jetpack-plan';
import { isPremium } from './is-premium';

export function isJetpackPremium( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isPremium( product ) && isJetpackPlan( product );
}
