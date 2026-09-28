import { getPlanNames } from '@automattic/api-core';
import { getTitanTierFromSlug, getTitanTierName } from '../emails/utils/titan-tiers';

/**
 * Display name for a scheduled downgrade's target product.
 *
 * `getPlanNames()` only covers site plans, so email tiers are resolved
 * separately. Returns null when the slug is neither, so callers can fall back
 * to a message without a product name.
 *
 * Kept out of `utils/purchase.ts`: that module is imported by tests which mock
 * `@automattic/api-core`, and the email tier utils read an enum at module load.
 */
export function getDowngradeTargetProductName( productSlug?: string | null ): string | null {
	if ( ! productSlug ) {
		return null;
	}

	const planNames = getPlanNames() as Record< string, string | undefined >;
	if ( planNames[ productSlug ] ) {
		return planNames[ productSlug ];
	}

	const titanTier = getTitanTierFromSlug( productSlug );
	return titanTier ? getTitanTierName( titanTier ) : null;
}
