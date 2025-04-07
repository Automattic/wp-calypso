import { PlanSlug } from '@automattic/calypso-products';
import { useSitePlans } from '@automattic/data-stores/src/plans';
import { COST_OVERRIDE_REASONS } from '@automattic/data-stores/src/plans/constants';
import { useMaxPlanUpgradeCredits } from './use-max-plan-upgrade-credits';

/**
 * This hook returns the domain-to-plan credit for a site, or null if the site is not eligible.
 * @param siteId
 * @param planSlugs
 * @returns The credit value or null
 */
export function useDomainToPlanCreditsApplicable(
	siteId?: number | null,
	planSlugs?: PlanSlug[]
): number | null {
	const { data: sitePlans } = useSitePlans( { siteId, coupon: undefined } );
	const plans = planSlugs || ( Object.keys( sitePlans || {} ) as PlanSlug[] );
	const isCreditForDomainToPlan = Object.values( sitePlans || {} ).some(
		( plan ) =>
			plan?.pricing?.costOverrides?.some(
				( override ) => override.overrideCode === COST_OVERRIDE_REASONS.RECENT_DOMAIN_PRORATION
			)
	);
	const credits = useMaxPlanUpgradeCredits( { siteId, plans } );

	return isCreditForDomainToPlan ? credits : null;
}
