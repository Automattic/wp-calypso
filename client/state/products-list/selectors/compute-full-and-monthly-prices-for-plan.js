import { GROUP_WPCOM, JETPACK_SEARCH_PRODUCTS } from '@automattic/calypso-products';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { getAllPostCounts } from 'calypso/state/posts/counts/selectors';
import getIntroOfferIsEligible from 'calypso/state/selectors/get-intro-offer-is-eligible';
import getIntroOfferPrice from 'calypso/state/selectors/get-intro-offer-price';
import { getPlanPrice } from './get-plan-price';
import { getProductCost } from './get-product-cost';
import { getProductPriceTierList } from './get-product-price-tiers';
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

	const isJetpackSearchProduct = JETPACK_SEARCH_PRODUCTS.includes( planObject.getStoreSlug() );

	// eslint-disable-next-line no-nested-ternary
	const planOrProductPrice = ! getPlanPrice( state, siteId, planObject, false )
		? isJetpackSearchProduct
			? getSearchProductTierPrice( state, siteId, planObject.getStoreSlug() )
			: getProductCost( state, planObject.getStoreSlug() )
		: getPlanPrice( state, siteId, planObject, false );
	const introOfferIsEligible = getIntroOfferIsEligible( state, planObject.getProductId(), siteId );
	const saleCouponDiscount = getProductSaleCouponDiscount( state, planObject.getStoreSlug() ) || 0;
	const introductoryOfferPrice = introOfferIsEligible
		? getIntroOfferPrice( state, planObject.getProductId(), siteId )
		: null;
	const saleCouponCost = isJetpackSearchProduct
		? Math.floor( planOrProductPrice * ( 1 - saleCouponDiscount ) * 100 ) / 100
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
 * Compute the Jetpack Search product tiered price based on the site's number of posts.
 *
 * @param {object} state Current redux state
 * @param {number} siteId Site ID to consider
 * @param {object} productSlug The product slug
 * @returns {number} The tiered price (given the site's number of published posts)
 */
function getSearchProductTierPrice( state, siteId, productSlug ) {
	const postsCounts = getAllPostCounts( state, siteId, 'post' );
	const postsCount = postsCounts?.publish || 0;
	const priceTierList = getProductPriceTierList( state, productSlug );
	const tier = priceTierList.filter(
		( tierItem ) => postsCount >= tierItem.minimum_units && postsCount <= tierItem.maximum_units
	);
	const minPrice = tier[ 0 ].minimum_price.toString(); // is missing decimal, ie- $9.95 is returned as 995
	return (
		// Inject decimal point into 100ths position.
		Number(
			minPrice.substring( 0, minPrice.length - 2 ) + '.' + minPrice.substring( minPrice.length - 2 )
		)
	);
}
