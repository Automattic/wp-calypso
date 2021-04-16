/**
 * Internal dependencies
 */
import { isJetpackPlan } from './is-jetpack-plan';
import { isMonthly } from './is-monthly';

export function isJetpackMonthlyPlan( product ) {
	return isMonthly( product ) && isJetpackPlan( product );
}
