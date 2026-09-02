import { isBusinessPlan, isEcommercePlan, isPremiumPlan } from '@automattic/calypso-products';

/**
 * build-wow transfers the site to Atomic, which is only available on these plans;
 * a Personal purchase would dead-end after paying.
 */
export function planSupportsBuildWow( planSlug: string | null | undefined ): boolean {
	return (
		!! planSlug &&
		( isPremiumPlan( planSlug ) || isBusinessPlan( planSlug ) || isEcommercePlan( planSlug ) )
	);
}
