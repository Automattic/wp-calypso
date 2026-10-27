import { getPlanNames, SubscriptionBillPeriod } from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';
import { getTitanTierFromSlug, getTitanTierName } from '../emails/utils/titan-tiers';
import type { Purchase } from '@automattic/api-core';

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

/**
 * Whether the purchase's scheduled change moves to a shorter billing term,
 * e.g. from Premium yearly to Premium or Business monthly.
 */
export function isScheduledTermChange( purchase: Purchase ): boolean {
	const targetBillPeriod = purchase.delayed_downgrade_bill_period_days;
	return (
		purchase.is_delayed_downgrade_pending &&
		!! targetBillPeriod &&
		!! purchase.bill_period_days &&
		targetBillPeriod < purchase.bill_period_days
	);
}

/**
 * Display name for a scheduled change's target product. For a term change
 * the name includes the new term, e.g. "Premium (monthly)", since the target
 * can be the same plan the purchase already is.
 */
export function getScheduledChangeTargetName(
	purchase: Purchase,
	hasEnTranslation: ( single: string ) => boolean
): string | null {
	const targetName = getDowngradeTargetProductName( purchase.delayed_downgrade_to_product_slug );
	if ( ! targetName || ! isScheduledTermChange( purchase ) ) {
		return targetName;
	}

	switch ( purchase.delayed_downgrade_bill_period_days ) {
		case SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD:
			if ( hasEnTranslation( '%s (monthly)' ) ) {
				// translators: %s is the name of the plan, e.g. "Premium"
				return sprintf( __( '%s (monthly)' ), targetName );
			}
			break;
		case SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD:
			if ( hasEnTranslation( '%s (yearly)' ) ) {
				// translators: %s is the name of the plan, e.g. "Premium"
				return sprintf( __( '%s (yearly)' ), targetName );
			}
			break;
		case SubscriptionBillPeriod.PLAN_BIENNIAL_PERIOD:
			if ( hasEnTranslation( '%s (2 years)' ) ) {
				// translators: %s is the name of the plan, e.g. "Premium"
				return sprintf( __( '%s (2 years)' ), targetName );
			}
			break;
	}
	return targetName;
}
