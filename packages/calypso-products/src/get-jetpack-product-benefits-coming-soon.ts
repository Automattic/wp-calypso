import { getJetpackProductsBenefitsComingSoon } from './translations';
import type { Product } from './types';
/**
 * Get Jetpack product "Benefits" that are coming soon based on the product purchase object.
 */
export function getJetpackProductBenefitsComingSoon( product: Product ) {
	const jetpackProductsBenefits = getJetpackProductsBenefitsComingSoon();
	return jetpackProductsBenefits[ product.product_slug ];
}
