import { GROUP_WPCOM } from '@automattic/calypso-products';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import getIntroOfferIsEligible from 'calypso/state/selectors/get-intro-offer-is-eligible';
import getIntroOfferPrice from 'calypso/state/selectors/get-intro-offer-price';
import {
	getSiteAvailableProductCost,
	getSiteAvailableProductSaleCouponCost,
	getSiteAvailableProductSaleCouponDiscount,
} from 'calypso/state/sites/products/selectors';
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

	const planOrProductPrice = getPlanOrProductPrice( state, siteId, planObject );
	const introOfferIsEligible = getIntroOfferIsEligible( state, planObject.getProductId(), siteId );
	const saleCouponDiscount = siteId
		? getSiteAvailableProductSaleCouponDiscount( state, siteId, planObject.getStoreSlug() ) || 0
		: getProductSaleCouponDiscount( state, planObject.getStoreSlug() ) || 0;
	const introductoryOfferPrice = introOfferIsEligible
		? getIntroOfferPrice( state, planObject.getProductId(), siteId )
		: null;
	const saleCouponCost = siteId
		? getSiteAvailableProductSaleCouponCost( state, siteId, planObject.getStoreSlug() )
		: getProductSaleCouponCost( state, planObject.getStoreSlug() );

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

/**
 * Returns the price of a product or plan.
 * If a valid `siteId` is provided, prices are gathered from the site-specific products list,
 * which contains the correct prices for tiered products, such as Jetpack Search (based on posts count),
 * ie- (state.sites.products[siteId].data - public-api.wordpress.com/rest/v1.1/sites/:siteId/products).
 * Otherwise, prices are gathered from state.productsList.items (public-api.wordpress.com/rest/v1.1/products)
 *
 * @param {object} state Current redux state
 * @param {number} siteId Site ID to consider
 * @param {object} planObject Plan object returned by getPlan() from @automattic/calypso-products
 * @returns {number} The requested price
 */
function getPlanOrProductPrice( state, siteId, planObject ) {
	const isProduct = ! getPlanPrice( state, siteId, planObject, false );
	if ( siteId ) {
		return isProduct
			? getSiteAvailableProductCost( state, siteId, planObject.getStoreSlug() )
			: getPlanPrice( state, siteId, planObject, false );
	}
	return isProduct
		? getProductCost( state, planObject.getStoreSlug() )
		: getPlanPrice( state, siteId, planObject, false );
}
