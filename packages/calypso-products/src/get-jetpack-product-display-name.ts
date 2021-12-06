import { getJetpackProductsDisplayNames } from './translations';
import type { Product } from './types';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product display name based on the product purchase object.
 */
export function getJetpackProductDisplayName( product: Product ): TranslateResult | undefined {
	const jetpackProductsDisplayNames = getJetpackProductsDisplayNames();
	return jetpackProductsDisplayNames[ product.product_slug ];
}
