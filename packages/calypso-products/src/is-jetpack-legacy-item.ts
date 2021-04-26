/**
 * Internal dependencies
 */
import { JETPACK_LEGACY_PLANS } from './constants';

/**
 * Type dependencies
 */
import type { JetpackLegacyPlanSlugs } from './types';

export default function isJetpackLegacyItem(
	itemSlug: string
): itemSlug is JetpackLegacyPlanSlugs {
	return JETPACK_LEGACY_PLANS.includes( itemSlug );
}
