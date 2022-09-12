import { getJetpackProductsIncludesInfo } from './translations';
import type { Product } from './types';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product "Includes" info based on the product purchase object.
 */
export function getJetpackProductIncludesInfo(
	product: Product
): Array< TranslateResult > | undefined {
	const jetpackProductsIncludesInfo = getJetpackProductsIncludesInfo() as Record<
		string,
		Array< TranslateResult >
	>;
	return jetpackProductsIncludesInfo[ product.product_slug ];
}
