import { getJetpackProductsShortNames } from './translations';
import type { Product } from './types';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product short name based on the product purchase object.
 */
export function getJetpackProductShortName( product: Product ): TranslateResult | undefined {
	const jetpackProductShortNames = getJetpackProductsShortNames();
	return jetpackProductShortNames[ product.product_slug ];
}
