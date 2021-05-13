/**
 * Internal dependencies
 */
import { isPlan } from './is-plan';
import { isJetpackPlan } from './is-jetpack-plan';

export function isDotComPlan( product ) {
	return isPlan( product ) && ! isJetpackPlan( product );
}
