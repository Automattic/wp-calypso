import { getJetpackProductsWhatIsIncludedComingSoon } from './translations';
import type { Product } from './types';
/**
 * Get Jetpack product "Includes" that are coming soon based on the product purchase object.
 */
export function getJetpackProductWhatIsIncludedComingSoon( product: Product ) {
	const jetpackProductsIncludesInfo = getJetpackProductsWhatIsIncludedComingSoon();
	return jetpackProductsIncludesInfo[ product.product_slug ];
}
