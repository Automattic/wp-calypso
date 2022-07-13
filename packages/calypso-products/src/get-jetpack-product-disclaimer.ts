import { getJetpackProductDisclaimers } from './translations';
import type { Product } from './types';
import type { TranslateResult } from 'i18n-calypso';

export function getJetpackProductDisclaimer( product: Product ): TranslateResult | undefined {
	const jetpackProductDisclaimers = getJetpackProductDisclaimers() as Record<
		string,
		TranslateResult
	>;
	return jetpackProductDisclaimers[ product.product_slug ];
}
