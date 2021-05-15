/**
 * Internal dependencies
 */
import {
	getPlan,
	getMonthlyPlanByYearly,
	getBillingMonthsForTerm,
	GROUP_WPCOM,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { getPlanPrice } from './get-plan-price';

/**
 * Computes a full and monthly price for a given plan, based on it's slug/constant
 *
 * @param {object} state Current redux state
 * @param {number} siteId Site ID to consider
 * @param {object} planObject Plan object returned by getPlan() from @automattic/calypso-products
 * @param {number} credits The number of free credits in cart
 * @param {object} couponDiscounts Absolute values of any discounts coming from a discount coupon
 * @returns {object} Object with a full and monthly price
 */
export const computeFullAndMonthlyPricesForPlan = (
	state,
	siteId,
	planObject,
	credits,
	couponDiscounts
) => {
	const couponDiscount = couponDiscounts[ planObject.getProductId() ] || 0;

	if ( planObject.group === GROUP_WPCOM ) {
		return computePricesForWpComPlan( state, planObject );
	}

	return {
		priceFullBeforeDiscount: getPlanRawPrice( state, planObject.getProductId(), false ),
		priceFull: getPlanPrice( state, siteId, planObject, false ),
		priceFinal: Math.max(
			getPlanPrice( state, siteId, planObject, false ) - credits - couponDiscount,
			0
		),
	};
};

/**
 * Compute a full and monthly price for a given wpcom plan.
 *
 * @param {object} state Current redux state
 * @param {object} planObject Plan object returned by getPlan() from @automattic/calypso-products
 */
function computePricesForWpComPlan( state, planObject ) {
	const priceFull = getPlanRawPrice( state, planObject.getProductId(), false ) || 0;
	const isMonthly = planObject.term === TERM_MONTHLY;
	const monthlyPlanObject = isMonthly
		? planObject
		: getPlan( getMonthlyPlanByYearly( planObject.getStoreSlug() ) );
	const priceMonthly = monthlyPlanObject
		? getPlanRawPrice( state, monthlyPlanObject.getProductId(), true ) || 0
		: 0;
	const priceFullBeforeDiscount = priceMonthly
		? priceMonthly * getBillingMonthsForTerm( planObject.term )
		: priceFull;

	return {
		priceFullBeforeDiscount,
		priceFull,
		priceFinal: priceFull,
	};
}
