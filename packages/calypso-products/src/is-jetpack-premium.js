/**
 * Internal dependencies
 */
import { isJetpackPlan } from './is-jetpack-plan';
import { isPremium } from './is-premium';

export function isJetpackPremium( product ) {
	return isPremium( product ) && isJetpackPlan( product );
}
