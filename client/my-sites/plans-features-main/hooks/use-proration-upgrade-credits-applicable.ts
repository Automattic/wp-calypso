import { PlanSlug } from '@automattic/calypso-products';
import { useSitePlans } from '@automattic/data-stores/src/plans';
import { COST_OVERRIDE_REASONS } from '@automattic/data-stores/src/plans/constants';
import { useMaxPlanUpgradeCredits } from './use-max-plan-upgrade-credits';

export type ProrationUpgradeCreditsApplicable = {
	credits: number;
	hasDomainProration: boolean;
	hasOtherUpgradeProration: boolean;
};

/**
 * This hook returns prorated upgrade credits for a site, or null if there is no proration-based discount.
 *
 * We treat `RECENT_DOMAIN_PRORATION` as domain-originated proration and `RECENT_PLAN_PRORATION` as
 * proration originating from other upgrades (e.g. add-ons) when showing the plans page notice.
 */
export function useProrationUpgradeCreditsApplicable(
	siteId?: number | null,
	planSlugs?: PlanSlug[]
): ProrationUpgradeCreditsApplicable | null {
	const { data: sitePlans } = useSitePlans( { siteId, coupon: undefined } );
	const plans = planSlugs || ( Object.keys( sitePlans || {} ) as PlanSlug[] );

	const { hasDomainProration, hasOtherUpgradeProration } = Object.values( sitePlans || {} ).reduce(
		( acc, plan ) => {
			const overrideCodes =
				plan?.pricing?.costOverrides?.map( ( override ) => override.overrideCode ) || [];
			return {
				hasDomainProration:
					acc.hasDomainProration ||
					overrideCodes.includes( COST_OVERRIDE_REASONS.RECENT_DOMAIN_PRORATION ),
				hasOtherUpgradeProration:
					acc.hasOtherUpgradeProration ||
					overrideCodes.includes( COST_OVERRIDE_REASONS.RECENT_PLAN_PRORATION ),
			};
		},
		{
			hasDomainProration: false,
			hasOtherUpgradeProration: false,
		}
	);

	const credits = useMaxPlanUpgradeCredits( { siteId, plans } );
	const hasAnyProration = hasDomainProration || hasOtherUpgradeProration;

	return hasAnyProration ? { credits, hasDomainProration, hasOtherUpgradeProration } : null;
}
