/**
 * Internal dependencies
 */
import { isJetpackPlan } from 'calypso/lib/products-values/is-jetpack-plan';
import { isMonthly } from 'calypso/lib/products-values/is-monthly';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isJetpackMonthlyPlan( product: FormattedProduct | CamelCaseProduct ): boolean {
	return isMonthly( product ) && isJetpackPlan( product );
}
