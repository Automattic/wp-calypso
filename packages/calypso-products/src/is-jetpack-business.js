/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { isJetpackPlan } from './is-jetpack-plan';
import { isBusiness } from './is-business';

export function isJetpackBusiness( product ) {
	product = formatProduct( product );

	return isBusiness( product ) && isJetpackPlan( product );
}
