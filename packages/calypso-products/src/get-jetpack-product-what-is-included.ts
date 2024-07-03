import { getJetpackProductsWhatIsIncluded } from './translations';
import type { Product } from './types';
/**
 * Get Jetpack product "Includes" info based on the product purchase object.
 */
export function getJetpackProductWhatIsIncluded( product: Product ) {
	const jetpackProductsIncludesInfo = getJetpackProductsWhatIsIncluded();
	return jetpackProductsIncludesInfo[ product.product_alias ?? product.product_slug ];
}
