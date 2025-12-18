import { PlanSlug } from '@automattic/calypso-products';
import { Plans, type SitePlan } from '@automattic/data-stores';
import { usePlanUpgradeCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits-applicable';
import { useMaxPlanUpgradeCredits } from './use-max-plan-upgrade-credits';

export type UpgradeCreditsNoticeSource =
	| 'plan'
	| 'domain'
	| 'other-upgrades'
	| 'domain-and-other-upgrades';

export type UpgradeCreditsNoticeData = {
	credits: number;
	source: UpgradeCreditsNoticeSource;
};

function getProrationFlags( sitePlans: Record< string, SitePlan > | undefined ): {
	hasDomainProration: boolean;
	hasOtherUpgradeProration: boolean;
	hasNonCouponDiscount: boolean;
} {
	let hasDomainProration = false;
	let hasOtherUpgradeProration = false;
	let hasNonCouponDiscount = false;

	for ( const plan of Object.values( sitePlans || {} ) ) {
		const overrideCodes =
			plan?.pricing?.costOverrides?.map( ( override ) => override.overrideCode ) || [];

		hasDomainProration =
			hasDomainProration ||
			overrideCodes.includes( Plans.COST_OVERRIDE_REASONS.RECENT_DOMAIN_PRORATION );
		hasOtherUpgradeProration =
			hasOtherUpgradeProration ||
			overrideCodes.includes( Plans.COST_OVERRIDE_REASONS.RECENT_PLAN_PRORATION );

		/**
		 * Some upgrade-credit discounts (notably add-ons on Free) may show up as a discounted
		 * price on the site plans endpoint without providing a cost override reason. In those
		 * cases, we treat "non-coupon discounted site plan pricing" as upgrade-credit proration.
		 */
		hasNonCouponDiscount =
			hasNonCouponDiscount ||
			( ! plan?.pricing?.hasSaleCoupon &&
				typeof plan?.pricing?.discountedPrice?.full === 'number' &&
				plan.pricing.discountedPrice.full < ( plan?.pricing?.originalPrice?.full ?? 0 ) );
	}

	return { hasDomainProration, hasOtherUpgradeProration, hasNonCouponDiscount };
}

/**
 * Unifies the logic for showing "upgrade credits" on the plans page:
 * - Paid plan -> higher plan upgrades (source: "plan")
 * - Domain-to-plan proration credits (source: "domain")
 * - Other proration credits (e.g. add-ons) (source: "other-upgrades")
 * - Domain + other upgrades proration (source: "domain-and-other-upgrades")
 */
export function useUpgradeCreditsNoticeData(
	siteId?: number | null,
	visiblePlans: PlanSlug[] = []
): UpgradeCreditsNoticeData | null {
	const planUpgradeCreditsApplicable = usePlanUpgradeCreditsApplicable( siteId, visiblePlans );
	const { data: sitePlans } = Plans.useSitePlans( { siteId, coupon: undefined } );
	const plans =
		visiblePlans.length > 0 ? visiblePlans : ( Object.keys( sitePlans || {} ) as PlanSlug[] );
	const maxCredits = useMaxPlanUpgradeCredits( { siteId, plans } );
	const { hasDomainProration, hasOtherUpgradeProration, hasNonCouponDiscount } =
		getProrationFlags( sitePlans );

	// 1) Preserve existing paid-plan upgrade behavior.
	if (
		planUpgradeCreditsApplicable !== null &&
		planUpgradeCreditsApplicable > 0 &&
		visiblePlans.length > 0
	) {
		return { credits: planUpgradeCreditsApplicable, source: 'plan' };
	}

	// 2) Proration-driven credits (covers free plan + add-ons, domain credits, or both).
	const hasInferredOtherUpgradeProration =
		! hasDomainProration && ! hasOtherUpgradeProration && hasNonCouponDiscount;
	const hasOtherUpgradesProration = hasOtherUpgradeProration || hasInferredOtherUpgradeProration;

	const hasAnyProration = hasDomainProration || hasOtherUpgradesProration;
	if ( hasAnyProration && maxCredits > 0 ) {
		// Only claim "both" when we have an explicit signal for both sources.
		if ( hasDomainProration && hasOtherUpgradeProration ) {
			return { credits: maxCredits, source: 'domain-and-other-upgrades' };
		}
		if ( hasDomainProration ) {
			return { credits: maxCredits, source: 'domain' };
		}
		return { credits: maxCredits, source: 'other-upgrades' };
	}

	return null;
}
