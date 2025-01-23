import { PlanSlug } from '@automattic/calypso-products';

/**
 * This hook determines if the domain-to-plan credit should be visible in the current plans display context
 * and returns the credits value if applicable
 * @param siteId Considered site id
 * @param visiblePlans Plans that are visible to the user
 * @returns number | null if the credit should not be displayed to the user
 */
export function useDomainToPlanCreditsApplicable(
	siteId?: number | null,
	visiblePlans: PlanSlug[] = []
): number | null {
	// TODO: Implement this hook
	return siteId && visiblePlans ? 10 : null;
}
