/**
 * Internal dependencies
 */
import { isJetpackPlan } from './is-jetpack-plan';
import { isMonthlyProduct } from './is-monthly';

export function isJetpackMonthlyPlan( product ) {
	return isMonthlyProduct( product ) && isJetpackPlan( product );
}
