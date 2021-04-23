/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { isJetpackPlan } from './is-jetpack-plan';
import { isBusiness } from './is-business';

export function isJetpackBusiness( product ) {
	product = snakeCase( product );

	return isBusiness( product ) && isJetpackPlan( product );
}
