import { useSelector } from 'react-redux';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import type { PlanSlug } from '@automattic/calypso-products';

/**
 * Calculate available plan credits given a set of displayed plans
 *
 * @param {*} siteId the selected site id
 * @param {PlanSlug[]}  plans Plans that are considered for the given calculation
 * @returns {number} The amount of credits available for the given plans
 */
export function usePlanUpgradeCredits( siteId: number | undefined, plans: PlanSlug[] ): number {
	const plansDetails = useSelector( ( state ) =>
		plans.map( ( planName: PlanSlug ) => ( {
			isPlanAvailableForPurchase: isPlanAvailableForPurchase( state, siteId ?? 0, planName ),
			...getPlanPrices( state, {
				siteId: null,
				planSlug: planName,
				returnMonthly: false,
			} ),
		} ) )
	);
	if ( ! siteId ) {
		return 0;
	}

	const creditsPerPlan = plansDetails.map(
		( { isPlanAvailableForPurchase, planDiscountedRawPrice, rawPrice } ) => {
			if ( ! isPlanAvailableForPurchase ) {
				return 0;
			}
			if ( typeof planDiscountedRawPrice !== 'number' || typeof rawPrice !== 'number' ) {
				return 0;
			}

			return rawPrice - planDiscountedRawPrice;
		}
	);
	return Math.max( ...creditsPerPlan );
}
