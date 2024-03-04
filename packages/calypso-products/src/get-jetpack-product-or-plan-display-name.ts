import { getJetpackProductDisplayName } from './get-jetpack-product-display-name';
import { getPlan } from './main';
import type { Product } from './types';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product display name based on the product purchase object.
 */
export function getJetpackProductOrPlanDisplayName(
	product: Product
): TranslateResult | undefined {
	return product?.product_name
		? getJetpackProductDisplayName( product )
		: getPlan( product.product_slug )?.getTitle();
}
