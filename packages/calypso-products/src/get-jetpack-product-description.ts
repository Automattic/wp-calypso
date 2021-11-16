import { getJetpackProductsDescriptions } from './translations';
import type { Product } from './types';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product description based on the product purchase object.
 */
export function getJetpackProductDescription( product: Product ): TranslateResult | undefined {
	const jetpackProductsDescriptions = getJetpackProductsDescriptions() as Record<
		string,
		TranslateResult
	>;
	return jetpackProductsDescriptions[ product.product_slug ];
}
