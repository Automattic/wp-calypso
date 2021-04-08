/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isJetpackPlanSlug } from 'calypso/lib/products-values/is-jetpack-plan-slug';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isJetpackPlan( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isJetpackPlanSlug( product.product_slug );
}
