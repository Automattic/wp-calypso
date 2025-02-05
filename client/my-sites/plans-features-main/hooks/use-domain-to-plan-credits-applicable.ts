import { PlanSlug } from '@automattic/calypso-products';
import { useSitePlans } from '@automattic/data-stores/src/plans';
import { COST_OVERRIDE_REASONS } from '@automattic/data-stores/src/plans/constants';
import { useSelector } from 'calypso/state';
import { hasPurchasedDomain } from 'calypso/state/purchases/selectors';
import { isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import { useMaxPlanUpgradeCredits } from './use-max-plan-upgrade-credits';

/**
 * This hook provides the domain-to-plan credit value if the site is eligible,
 * or null if the site is not eligible
 * @param siteId The ID of the site
 * @param visiblePlans The plans that are visible to the user
 * @returns The credit value or null if the site is not eligible
 */
export function useDomainToPlanCreditsApplicable(
	siteId?: number | null,
	visiblePlans: PlanSlug[] = []
): number | null {
	const isSiteOnFreePlan = !! useSelector(
		( state ) => siteId && ! isCurrentPlanPaid( state, siteId )
	);
	const hasSitePurchasedDomain = !! useSelector(
		( state ) => siteId && hasPurchasedDomain( state, siteId )
	);
	const isSiteEligible = isSiteOnFreePlan && hasSitePurchasedDomain;

	const { data: sitePlans } = useSitePlans( { siteId, coupon: undefined } );
	const isUpgradeCreditForDomainProration = Object.values( sitePlans || {} ).some(
		( plan ) =>
			plan?.pricing?.costOverrides?.some(
				( override ) => override.overrideCode === COST_OVERRIDE_REASONS.RECENT_DOMAIN_PRORATION
			)
	);

	const creditsValue = useMaxPlanUpgradeCredits( { siteId, plans: visiblePlans } );

	return isSiteEligible && isUpgradeCreditForDomainProration ? creditsValue : null;
}
