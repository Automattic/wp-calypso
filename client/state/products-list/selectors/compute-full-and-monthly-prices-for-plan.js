/**
 * External dependencies
 */
import { max } from 'lodash';

/**
 * Internal dependencies
 */
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
