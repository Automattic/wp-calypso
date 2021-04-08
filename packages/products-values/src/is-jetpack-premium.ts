/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isJetpackPlan } from 'calypso/lib/products-values/is-jetpack-plan';
import { isPremium } from 'calypso/lib/products-values/is-premium';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isJetpackPremium( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isPremium( product ) && isJetpackPlan( product );
}
