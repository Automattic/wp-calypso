/**
 * Internal dependencies
 */
import { JETPACK_PRODUCTS_LIST } from 'lib/products-values/constants';
import { getJetpackProductsDisplayNames } from 'lib/products-values/translations';

/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product display name based on the product slug
 *
 * @param {string} slug Product slug
 * @returns {TranslateResult} Product display name
 */
export function getJetpackProductDisplayNameBySlug( slug: string ): TranslateResult | undefined {
	const jetpackProductsDisplayNames = getJetpackProductsDisplayNames() as Record<
		typeof JETPACK_PRODUCTS_LIST[ number ],
		TranslateResult
	>;

	return jetpackProductsDisplayNames[ slug ];
}
