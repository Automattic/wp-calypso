import { JETPACK_LEGACY_PLANS } from './constants';
import type { JetpackLegacyPlanSlugs } from './types';

export default function isJetpackLegacyItem(
	itemSlug: string
): itemSlug is JetpackLegacyPlanSlugs {
	return JETPACK_LEGACY_PLANS.includes( itemSlug );
}
