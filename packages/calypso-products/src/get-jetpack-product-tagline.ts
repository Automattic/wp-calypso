import { getJetpackProductsTaglines } from './translations';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product tagline based on the product purchase object.
 */
export function getJetpackProductTagline(
	product: { product_slug: string },
	isOwned = false
): TranslateResult | undefined {
	const jetpackProductsTaglines = getJetpackProductsTaglines();
	const productTagline = jetpackProductsTaglines[ product.product_slug ];
	return isOwned ? productTagline?.owned || productTagline?.default : productTagline?.default;
}
