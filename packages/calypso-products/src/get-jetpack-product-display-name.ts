import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { getJetpackProductsDisplayNames } from './translations';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product display name based on the product purchase object.
 */
export function getJetpackProductDisplayName(
	product: WithSnakeCaseSlug | WithCamelCaseSlug
): TranslateResult | undefined {
	const jetpackProductsDisplayNames = getJetpackProductsDisplayNames();
	return jetpackProductsDisplayNames[ camelOrSnakeSlug( product ) ];
}
