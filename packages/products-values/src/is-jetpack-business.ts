/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isJetpackPlan } from 'calypso/lib/products-values/is-jetpack-plan';
import { isBusiness } from 'calypso/lib/products-values/is-business';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isJetpackBusiness( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isBusiness( product ) && isJetpackPlan( product );
}
