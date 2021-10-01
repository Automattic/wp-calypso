import { isJetpackPlan } from './is-jetpack-plan';
import { isPlan } from './is-plan';

export function isDotComPlan( product ) {
	return isPlan( product ) && ! isJetpackPlan( product );
}
