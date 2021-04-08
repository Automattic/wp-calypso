/**
 * Internal dependencies
 */
import { PLAN_JETPACK_FREE } from 'calypso/lib/plans/constants';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isFreeJetpackPlan( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return product.product_slug === PLAN_JETPACK_FREE;
}
