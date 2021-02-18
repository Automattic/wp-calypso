/**
 * Internal dependencies
 */
import { isPlan } from 'calypso/lib/products-values/is-plan';
import { isJetpackPlan } from 'calypso/lib/products-values/is-jetpack-plan';

export function isDotComPlan( product ) {
	return isPlan( product ) && ! isJetpackPlan( product );
}
