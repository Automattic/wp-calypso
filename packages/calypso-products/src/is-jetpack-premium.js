/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { isJetpackPlan } from './is-jetpack-plan';
import { isPremium } from './is-premium';

export function isJetpackPremium( product ) {
	product = snakeCase( product );

	return isPremium( product ) && isJetpackPlan( product );
}
