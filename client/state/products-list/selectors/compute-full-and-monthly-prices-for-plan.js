import { GROUP_WPCOM } from '@automattic/calypso-products';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import getIntroOfferIsEligible from 'calypso/state/selectors/get-intro-offer-is-eligible';
import getIntroOfferPrice from 'calypso/state/selectors/get-intro-offer-price';
import { getPlanPrice } from './get-plan-price';
import { getProductCost } from './get-product-cost';
import { getProductSaleCouponCost } from './get-product-sale-coupon-cost';
import { getProductSaleCouponDiscount } from './get-product-sale-coupon-discount';

/**
 * Computes a full and monthly price for a given plan, based on it's slug/constant
 *
 * @param {object} state Current redux state
 * @param {number} siteId Site ID to consider
 * @param {object} planObject Plan object returned by getPlan() from @automattic/calypso-products
 * @returns {object} Object with a full and monthly price
 */
export const computeFullAndMonthlyPricesForPlan = ( state, siteId, planObject ) => {
	if ( planObject.group === GROUP_WPCOM ) {
		return computePricesForWpComPlan( state, siteId, planObject );
	}

	const planOrProductPrice = ! getPlanPrice( state, siteId, planObject, false )
		? getProductCost( state, planObject.getStoreSlug() )
		: getPlanPrice( state, siteId, planObject, false );
	const introOfferIsEligible = getIntroOfferIsEligible( state, planObject.getProductId(), siteId );
	const saleCouponDiscount = getProductSaleCouponDiscount( state, planObject.getStoreSlug() ) || 0;
	const introductoryOfferPrice = introOfferIsEligible
		? getIntroOfferPrice( state, planObject.getProductId(), siteId )
		: null;
	const saleCouponCost = getProductSaleCouponCost( state, planObject.getStoreSlug() );

	return {
		priceFull: planOrProductPrice,
		priceFinal: saleCouponCost || planOrProductPrice,
		introductoryOfferPrice:
			introductoryOfferPrice !== null ? introductoryOfferPrice * ( 1 - saleCouponDiscount ) : null,
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
