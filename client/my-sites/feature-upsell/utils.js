/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { getPlan } from 'lib/plans';
import { getPlanRawPrice } from 'state/plans/selectors';
import { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';

export const getUpsellPlanPrice = ( state, upsellPlanSlug, selectedSiteId ) => {
	const upsellPlan = getPlan( upsellPlanSlug );
	const upsellPlanId = upsellPlan.getProductId();
	const rawPrice = getPlanRawPrice( state, upsellPlanId, false );
	const discountedRawPrice = getPlanDiscountedRawPrice( state, selectedSiteId, upsellPlanSlug, {
		isMonthly: false,
	} );
	return discountedRawPrice || rawPrice;
};
