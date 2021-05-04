/**
 * Internal dependencies
 */
import { JETPACK_LEGACY_PLANS } from './constants';

/**
 * Type dependencies
 */
import type { JetpackLegacyPlanSlug } from './types';

export default function isJetpackLegacyItem( itemSlug: string ): itemSlug is JetpackLegacyPlanSlug {
	return JETPACK_LEGACY_PLANS.includes( itemSlug as JetpackLegacyPlanSlug );
}
