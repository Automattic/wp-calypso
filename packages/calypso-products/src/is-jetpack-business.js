/**
 * Internal dependencies
 */
import { isJetpackPlan } from './is-jetpack-plan';
import { isBusiness } from './is-business';

export function isJetpackBusiness( product ) {
	return isBusiness( product ) && isJetpackPlan( product );
}
