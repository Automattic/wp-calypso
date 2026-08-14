import { DotcomPlans } from '@automattic/api-core';

/**
 * Storage included with each WordPress.com plan, in GB.
 *
 * Note that this map doubles as the plan-expiry notice's product allowlist: a
 * slug missing from it is not eligible for the notice at all. See
 * `isEligibleForPlanExpiryNotice`. A new plan tier has to be added here as well
 * as to `getPlanNames()`, or the notice silently skips it.
 *
 * TODO: these numbers should not be hardcoded. They should eventually come from
 * the server — but that has to be done consistently across the whole interface
 * (the plans grid, the cancellation feature lists, the storage meters) rather
 * than only here, so that a single source of truth is established instead of a
 * third one being introduced.
 *
 * These mirror what `getStorageFeature()` returns for each plan in
 * `packages/calypso-products/src/plans-list.tsx`, which this file cannot
 * import: the dashboard is not allowed to depend on
 * `@automattic/calypso-products`.
 */
const PLAN_STORAGE_IN_GB: Record< string, number > = {
	[ DotcomPlans.PERSONAL ]: 6,
	[ DotcomPlans.PERSONAL_MONTHLY ]: 6,
	[ DotcomPlans.PERSONAL_2_YEARS ]: 6,
	[ DotcomPlans.PERSONAL_3_YEARS ]: 6,
	[ DotcomPlans.PREMIUM ]: 13,
	[ DotcomPlans.PREMIUM_MONTHLY ]: 13,
	[ DotcomPlans.PREMIUM_2_YEARS ]: 13,
	[ DotcomPlans.PREMIUM_3_YEARS ]: 13,
	[ DotcomPlans.BUSINESS ]: 50,
	[ DotcomPlans.BUSINESS_MONTHLY ]: 50,
	[ DotcomPlans.BUSINESS_2_YEARS ]: 50,
	[ DotcomPlans.BUSINESS_3_YEARS ]: 50,
	[ DotcomPlans.ECOMMERCE ]: 50,
	[ DotcomPlans.ECOMMERCE_MONTHLY ]: 50,
	[ DotcomPlans.ECOMMERCE_2_YEARS ]: 50,
	[ DotcomPlans.ECOMMERCE_3_YEARS ]: 50,
};

/**
 * Storage included with the given plan, in GB, or null for a product slug that
 * is not a WordPress.com plan.
 */
export function getPlanStorageInGb( productSlug: string ): number | null {
	return PLAN_STORAGE_IN_GB[ productSlug ] ?? null;
}
