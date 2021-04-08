/**
 * Internal dependencies
 */
import { isPlan } from 'calypso/lib/products-values/is-plan';
import { isJetpackPlan } from 'calypso/lib/products-values/is-jetpack-plan';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isDotComPlan( product: FormattedProduct | CamelCaseProduct ): boolean {
	return isPlan( product ) && ! isJetpackPlan( product );
}
