import { useSelector } from 'calypso/state';
import { getPlanDiscountedRawPrice } from 'calypso/state/sites/plans/selectors';
import { getSitePlanRawPrice } from 'calypso/state/sites/plans/selectors/get-site-plan-raw-price';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import type { PlanSlug } from '@automattic/calypso-products';

interface Props {
	siteId?: number | null;
	plans: PlanSlug[];
}

/**
 * Calculate available plan credits given a set of displayed plans
 * This is the maximum possible credit value possible when comparing credits per plan
 * @returns {number} The maximum amount of credits possible for a given set of plans
 */
export function useCalculateMaxPlanUpgradeCredit( { siteId, plans }: Props ): number {
	const plansDetails = useSelector( ( state ) =>
		plans.map( ( planName ) => ( {
			isPlanAvailableForPurchase: isPlanAvailableForPurchase( state, siteId ?? 0, planName ),
			planDiscountedRawPrice: getPlanDiscountedRawPrice( state, siteId ?? 0, planName ),
			sitePlanRawPrice: getSitePlanRawPrice( state, siteId ?? 0, planName ),
		} ) )
	);

	if ( ! siteId ) {
		return 0;
	}

	const creditsPerPlan = plansDetails.map(
		( { isPlanAvailableForPurchase, planDiscountedRawPrice, sitePlanRawPrice } ) => {
			if ( ! isPlanAvailableForPurchase ) {
				return 0;
			}
			if ( typeof planDiscountedRawPrice !== 'number' || typeof sitePlanRawPrice !== 'number' ) {
				return 0;
			}

			return sitePlanRawPrice - planDiscountedRawPrice;
		}
	);

	return Math.max( ...creditsPerPlan );
}
