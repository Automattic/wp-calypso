import { PlanSlug } from '@automattic/calypso-products';
import { useSelector } from 'calypso/state';
import { hasPurchasedDomain } from 'calypso/state/purchases/selectors';
import { isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import { useMaxPlanUpgradeCredits } from './use-max-plan-upgrade-credits';

/**
 * This hook determines if the domain-to-plan upgrade credit should be visible in the current plans display context
 * and returns the credits value if applicable
 * @param siteId Considered site id
 * @param visiblePlans Plans that are visible to the user
 * @returns number | null if the credit should not be displayed to the user
 */
export function useDomainToPlanCreditsApplicable(
	siteId?: number | null,
	visiblePlans: PlanSlug[] = []
): number | null {
	const hasSitePurchasedDomain = !! useSelector(
		( state ) => siteId && hasPurchasedDomain( state, siteId )
	);
	const isSiteOnFreePlan = !! useSelector(
		( state ) => siteId && ! isCurrentPlanPaid( state, siteId )
	);
	const isSiteEligible = hasSitePurchasedDomain && isSiteOnFreePlan;
	const creditsValue = useMaxPlanUpgradeCredits( { siteId, plans: visiblePlans } );

	return isSiteEligible ? creditsValue : null;
}
