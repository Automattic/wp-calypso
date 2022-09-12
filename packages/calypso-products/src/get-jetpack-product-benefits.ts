import { getJetpackProductsBenefits } from './translations';
import type { Product } from './types';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product "Benefits" info based on the product purchase object.
 */
export function getJetpackProductBenefits(
	product: Product
): Array< TranslateResult > | undefined {
	const jetpackProductsBenefits = getJetpackProductsBenefits() as Record<
		string,
		Array< TranslateResult >
	>;
	return jetpackProductsBenefits[ product.product_slug ];
}
