import { GROUP_WPCOM } from '@automattic/calypso-products';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import getIntroOfferIsEligible from 'calypso/state/selectors/get-intro-offer-is-eligible';
import getIntroOfferPrice from 'calypso/state/selectors/get-intro-offer-price';
import { getPlanPrice } from './get-plan-price';
import { getProductCost } from './get-product-cost';

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
	const couponDiscount = couponDiscounts[ planObject.getStoreSlug() ] || 1;

	if ( planObject.group === GROUP_WPCOM ) {
		return computePricesForWpComPlan( state, siteId, planObject );
	}

	const planOrProductPrice = ! getPlanPrice( state, siteId, planObject, false )
		? getProductCost( state, planObject.getStoreSlug() )
		: getPlanPrice( state, siteId, planObject, false );
	const introOfferIsEligible = getIntroOfferIsEligible( state, planObject.getProductId(), siteId );
	const introductoryOfferPrice = introOfferIsEligible
		? getIntroOfferPrice( state, planObject.getProductId(), siteId )
		: null;

	return {
		priceFull: planOrProductPrice,
		priceFinal: Math.max( planOrProductPrice * couponDiscount - credits, 0 ),
		introductoryOfferPrice:
			introductoryOfferPrice !== null
				? Math.max( introductoryOfferPrice * couponDiscount - credits, 0 )
				: introductoryOfferPrice,
	};
};

/**
 * Compute a full and monthly price for a given wpcom plan.
 *
 * @param {object} state Current redux state
 * @param {number} siteId Site ID to consider
 * @param {object} planObject Plan object returned by getPlan() from @automattic/calypso-products
 */
function computePricesForWpComPlan( state, siteId, planObject ) {
	const priceFull = getPlanRawPrice( state, planObject.getProductId(), false ) || 0;
	const introductoryOfferPrice = getIntroOfferPrice( state, planObject.getProductId(), siteId );

	return {
		priceFull,
		priceFinal: priceFull,
		introductoryOfferPrice,
	};
}
