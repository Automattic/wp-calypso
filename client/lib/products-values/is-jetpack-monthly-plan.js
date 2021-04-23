/**
 * Internal dependencies
 */
import { isJetpackPlan } from 'calypso/lib/products-values/is-jetpack-plan';
import { isMonthly } from 'calypso/lib/products-values/is-monthly';

export function isJetpackMonthlyPlan( product ) {
	return isMonthly( product ) && isJetpackPlan( product );
}
