/**
 * Internal dependencies
 */
import { isPlan } from 'lib/products-values/is-plan';
import { isJetpackPlan } from 'lib/products-values/is-jetpack-plan';

export function isDotComPlan( product ) {
	return isPlan( product ) && ! isJetpackPlan( product );
}
