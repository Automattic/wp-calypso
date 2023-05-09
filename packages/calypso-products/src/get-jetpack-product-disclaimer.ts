import { getJetpackProductDisclaimers } from './translations';
import { ProductSlug, PlanSlug, SelectorProductFeaturesItem } from './types';
import type { TranslateResult } from 'i18n-calypso';

export function getJetpackProductDisclaimer(
	product_slug: ProductSlug | PlanSlug,
	features: SelectorProductFeaturesItem[],
	link: string
): TranslateResult | undefined {
	const jetpackProductDisclaimers = getJetpackProductDisclaimers( features, link ) as Record<
		string,
		TranslateResult
	>;
	return jetpackProductDisclaimers[ product_slug ];
}
