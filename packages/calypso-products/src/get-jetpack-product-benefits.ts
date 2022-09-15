import { getJetpackProductsBenefits } from './translations';
import type { Product } from './types';
/**
 * Get Jetpack product "Benefits" info based on the product purchase object.
 */
export function getJetpackProductBenefits( product: Product ) {
	const jetpackProductsBenefits = getJetpackProductsBenefits();
	return jetpackProductsBenefits[ product.product_slug ];
}
