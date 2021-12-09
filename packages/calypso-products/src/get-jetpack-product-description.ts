import { getJetpackProductsDescriptions } from './translations';
import type { Product } from './types';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product description based on the product purchase object.
 */
export function getJetpackProductDescription( product: Product ): TranslateResult {
	const jetpackProductsDescriptions = getJetpackProductsDescriptions();
	return jetpackProductsDescriptions[ product.product_slug ];
}
