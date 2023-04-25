import { useSelector } from 'react-redux';
import { getPlanDiscountedRawPrice } from 'calypso/state/sites/plans/selectors';
import { getSitePlanRawPrice } from 'calypso/state/sites/plans/selectors/get-site-plan-raw-price';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';

/**
 * Calculate available plan credits given a set of displayed plans
 *
 * @param {*} siteId the selected site id
 * @param {string[]}  plans Plans that are considered for the given calculation
 * @returns {number} The amount of credits available for the given plans
 */
export function usePlanUpgradeCredits( siteId: number | undefined, plans: string[] ): number {
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
