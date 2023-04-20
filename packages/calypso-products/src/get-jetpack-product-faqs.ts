import { getJetpackProductsFAQs } from './translations';
import type { Product } from './types';
/**
 * Get Jetpack product "FAQs" info based on the product purchase object.
 */
export function getJetpackProductFAQs( product: Product ) {
	const jetpackProductsFAQsInfo = getJetpackProductsFAQs();
	return jetpackProductsFAQsInfo[ product.product_slug ];
}
