import { getJetpackPlansAlsoIncludedFeatures } from './translations';
import type { PlanSlug } from './types';
/**
 * Get Jetpack plan "Also includes" info based on the product purchase object.
 */
export function getJetpackPlanAlsoIncludedFeatures( productSlug: PlanSlug ) {
	const jetpackPlanAlsoIncludedInfo = getJetpackPlansAlsoIncludedFeatures();
	return jetpackPlanAlsoIncludedInfo[ productSlug ];
}
