/**
 * External dependencies
 */
import { max } from 'lodash';

/**
 * Internal dependencies
 */
import { getPlan, getMonthlyPlanByYearly, getBillingMonthsForTerm } from 'calypso/lib/plans';
import { GROUP_WPCOM, TERM_MONTHLY } from 'calypso/lib/plans/constants';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { getPlanPrice } from './get-plan-price';

/**
 * Computes a full and monthly price for a given plan, based on it's slug/constant
 *
 * @param {object} state Current redux state
 * @param {number} siteId Site ID to consider
 * @param {object} planObject Plan object returned by getPlan() from lib/plans
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
		priceFinal: max( [
			getPlanPrice( state, siteId, planObject, false ) - credits - couponDiscount,
			0,
		] ),
		priceMonthly: getPlanPrice( state, siteId, planObject, true ),
	};
};

/**
 * Compute a full and monthly price for a given wpcom plan.
 *
 * @param {object} state Current redux state
 * @param {object} planObject Plan object returned by getPlan() from lib/plans
 */
function computePricesForWpComPlan( state, planObject ) {
	const priceFull = getPlanRawPrice( state, planObject.getProductId(), false );
	const isMonthly = planObject.term === TERM_MONTHLY;
	const monthlyPlanObject = isMonthly
		? planObject
		: getPlan( getMonthlyPlanByYearly( planObject.getStoreSlug() ) );
	const priceMonthly = getPlanRawPrice( state, monthlyPlanObject.getProductId(), true );
	const priceFullBeforeDiscount = priceMonthly * getBillingMonthsForTerm( planObject.term );

	return {
		priceFullBeforeDiscount,
		priceFull,
		priceFinal: priceFull,
		priceMonthly,
	};
}
