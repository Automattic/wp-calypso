import { isMonthly } from './is-monthly';
import { getPlanClass } from './main';

export const PLAN_TIER_ORDER: Record< string, number > = {
	'is-free-plan': 0,
	'is-flexible-plan': 0,
	'is-blogger-plan': 1,
	'is-personal-plan': 2,
	'is-premium-plan': 3,
	'is-business-plan': 4,
	'is-ecommerce-plan': 5,
};

/** Eligible source plans for expired-plan downgrades. */
const ELIGIBLE_SOURCE_TIERS = new Set( [
	'is-personal-plan',
	'is-premium-plan',
	'is-business-plan',
	'is-ecommerce-plan',
] );

// Minimum number of days after expiry before showing lower-tier options for monthly plans.
// This avoids cannibalizing renewals that would have happened during the retry window.
const MONTHLY_PLAN_DELAY_DAYS = 6;

/**
 * Determines if a lower-tier plan can be purchased for a site whose plan has expired.
 * @param currentPlanSlug - The slug of the user's current (expired) plan
 * @param targetPlanSlug  - The slug of the plan the user wants to purchase
 * @param expiryDate      - The expiry date of the current plan (ISO string or Date)
 * @returns true if the target plan is a valid lower-tier purchase for this expired plan
 */
export function isLowerPlanPurchasableForExpiredSite(
	currentPlanSlug: string,
	targetPlanSlug: string,
	expiryDate?: string | Date | null
): boolean {
	const currentTier = getPlanClass( currentPlanSlug );
	const targetTier = getPlanClass( targetPlanSlug );

	// Current plan must be an eligible source tier (Personal, Premium, or Business).
	if ( ! ELIGIBLE_SOURCE_TIERS.has( currentTier ) ) {
		return false;
	}

	const currentOrder = PLAN_TIER_ORDER[ currentTier ];
	const targetOrder = PLAN_TIER_ORDER[ targetTier ];

	// Both tiers must be recognized and the target must be strictly lower.
	if ( currentOrder === undefined || targetOrder === undefined || targetOrder >= currentOrder ) {
		return false;
	}

	// For monthly plans, enforce a delay after expiry to avoid cannibalizing retried renewals.
	if ( isMonthly( currentPlanSlug ) && expiryDate ) {
		const expiryTime =
			expiryDate instanceof Date ? expiryDate.getTime() : new Date( expiryDate ).getTime();
		const daysSinceExpiry = ( Date.now() - expiryTime ) / ( 1000 * 60 * 60 * 24 );

		if ( daysSinceExpiry < MONTHLY_PLAN_DELAY_DAYS ) {
			return false;
		}
	}

	return true;
}
