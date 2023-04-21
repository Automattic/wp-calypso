import { getPlanDiscountedRawPrice } from './get-plan-discounted-raw-price';
import { getSitePlanRawPrice } from './get-site-plan-raw-price';
import isPlanAvailableForPurchase from './is-plan-available-for-purchase';
import type { IAppState } from 'calypso/state/types';

/**
 * Calculate available plan credits given a set of displayed plans
 *
 * @param {*} state app state
 * @param {*} siteId the selected site id
 * @param {string[]}  consideredPlans Plans that are considered for the given calcuation
 * @returns {number} The amount of credits available for the given plans
 */
export function calculatePlanUpgradeCredits(
	state: IAppState,
	siteId: number | undefined,
	consideredPlans: string[]
): number {
	if ( ! siteId ) {
		return 0;
	}

	const creditsPerPlan = consideredPlans.map( ( planName ) => {
		const availableForPurchase = isPlanAvailableForPurchase( state, siteId, planName );
		if ( ! availableForPurchase ) {
			return 0;
		}
		const annualDiscountPrice = getPlanDiscountedRawPrice( state, siteId, planName );
		const annualRawPrice = getSitePlanRawPrice( state, siteId, planName );
		if ( typeof annualDiscountPrice !== 'number' || typeof annualRawPrice !== 'number' ) {
			return 0;
		}

		return annualRawPrice - annualDiscountPrice;
	} );

	return Math.max( ...creditsPerPlan );
}
