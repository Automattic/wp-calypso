import {
	isBusinessPlan,
	isEcommercePlan,
	isPersonalPlan,
	isPremiumPlan,
} from '@automattic/calypso-products';

/**
 * build-wow transfers the site to Atomic. WordPress.com grants that feature to
 * Personal, Premium, Business and Commerce (the frozen client-side plan data
 * understates this), so only a plan outside those tiers falls back to the
 * legacy builder.
 */
export function planSupportsBuildWow( planSlug: string | null | undefined ): boolean {
	return (
		!! planSlug &&
		( isPersonalPlan( planSlug ) ||
			isPremiumPlan( planSlug ) ||
			isBusinessPlan( planSlug ) ||
			isEcommercePlan( planSlug ) )
	);
}
