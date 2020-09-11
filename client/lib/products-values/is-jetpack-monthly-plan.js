/**
 * Internal dependencies
 */
import { isJetpackPlan } from 'lib/products-values/is-jetpack-plan';
import { isMonthly } from 'lib/products-values/is-monthly';

export function isJetpackMonthlyPlan( product ) {
	return isMonthly( product ) && isJetpackPlan( product );
}
