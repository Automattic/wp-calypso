import { getJetpackProductsShortDescriptions } from './translations';
import type { Product } from './types';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product short description based on the product purchase object.
 */
export function getJetpackProductShortDescription( product: Product ): TranslateResult | undefined {
	const jetpackProductsShortDescriptions = getJetpackProductsShortDescriptions() as Record<
		string,
		TranslateResult
	>;
	return jetpackProductsShortDescriptions[ product.product_slug ];
}
