import {
	getPriceTierForUnits,
	GROUP_WPCOM,
	JETPACK_SEARCH_PRODUCTS,
} from '@automattic/calypso-products';
import { getCurrencyDefaults } from '@automattic/format-currency';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import getIntroOfferIsEligible from 'calypso/state/selectors/get-intro-offer-is-eligible';
import getIntroOfferPrice from 'calypso/state/selectors/get-intro-offer-price';
import { getPlanPrice } from './get-plan-price';
import { getProductCost } from './get-product-cost';
import { getProductPriceTierList } from './get-product-price-tiers';
import { getProductSaleCouponCost } from './get-product-sale-coupon-cost';
import { getProductSaleCouponDiscount } from './get-product-sale-coupon-discount';
import type { Plan, PlanSlug, ProductSlug } from '@automattic/calypso-products';
import type { AppState } from 'calypso/types';

export interface FullAndMonthlyPrices {
	priceFull: number | null;
	priceFinal: number | null;
	introductoryOfferPrice: number | null;
}

type PlanOrProductSlug = PlanSlug | ProductSlug;
type Optional< T, K extends keyof T > = Pick< Partial< T >, K > & Omit< T, K >;
export type PlanObject = Optional< Pick< Plan, 'group' | 'getProductId' >, 'group' > & {
	getStoreSlug: () => PlanOrProductSlug;
};

/**
 * Computes a full and monthly price for a given plan, based on its slug/constant
 *
 * planObject is the plan object returned by getPlan() from @automattic/calypso-products
 */
export const computeFullAndMonthlyPricesForPlan = (
	state: AppState,
	siteId: number | undefined,
	planObject: PlanObject,
	currentQuantity: number | null
): FullAndMonthlyPrices => {
	if ( planObject.group === GROUP_WPCOM ) {
		return computePricesForWpComPlan( state, siteId, planObject );
	}

	const isJetpackSearchProduct = ( JETPACK_SEARCH_PRODUCTS as ReadonlyArray< string > ).includes(
		planObject.getStoreSlug()
	);

	// eslint-disable-next-line no-nested-ternary
	const planOrProductPrice = ! getPlanPrice( state, siteId, planObject, false )
		? isJetpackSearchProduct
			? getSearchProductTierPrice( state, siteId, planObject.getStoreSlug(), currentQuantity ?? 1 )
			: getProductCost( state, planObject.getStoreSlug() )
		: getPlanPrice( state, siteId, planObject, false );
	const introOfferIsEligible = getIntroOfferIsEligible( state, planObject.getProductId(), siteId );
	const saleCouponDiscount = getProductSaleCouponDiscount( state, planObject.getStoreSlug() ) || 0;
	const introductoryOfferPrice = introOfferIsEligible
		? getIntroOfferPrice( state, planObject.getProductId(), siteId )
		: null;
	const saleCouponCost = isJetpackSearchProduct
		? calculateSaleCouponCostForJetpackProduct( planOrProductPrice, saleCouponDiscount )
		: getProductSaleCouponCost( state, planObject.getStoreSlug() );

	return {
		priceFull: planOrProductPrice,
		priceFinal: saleCouponCost || planOrProductPrice,
		introductoryOfferPrice:
			introductoryOfferPrice !== null ? introductoryOfferPrice * ( 1 - saleCouponDiscount ) : null,
	};
};

function calculateSaleCouponCostForJetpackProduct(
	price: number | null,
	saleCouponDiscount: number
): number | null {
	if ( ! price ) {
		return null;
	}
	return Math.floor( price * ( 1 - saleCouponDiscount ) * 100 ) / 100;
}

/**
 * Compute a full and monthly price for a given wpcom plan.
 *
 * planObject is the plan object returned by getPlan() from @automattic/calypso-products
 */
function computePricesForWpComPlan(
	state: AppState,
	siteId: number | undefined,
	planObject: PlanObject
): FullAndMonthlyPrices {
	const priceFull = getPlanRawPrice( state, planObject.getProductId(), false ) || 0;
	const introductoryOfferPrice = getIntroOfferPrice( state, planObject.getProductId(), siteId );

	return {
		priceFull,
		priceFinal: priceFull,
		introductoryOfferPrice,
	};
}

/**
 * Compute the Jetpack Search product tiered price based on the site's number of published posts.
 */
function getSearchProductTierPrice(
	state: AppState,
	siteId: number | undefined,
	productSlug: string,
	currentQuantity: number
): number | null {
	const priceTierList = getProductPriceTierList( state, productSlug );
	const tier = getPriceTierForUnits( priceTierList, currentQuantity );
	if ( ! tier ) {
		return null;
	}
	if ( ! tier.transform_quantity_divide_by || ! tier.per_unit_fee ) {
		return null;
	}
	let units_used: number;
	if ( tier.transform_quantity_round === 'down' ) {
		units_used = Math.floor( currentQuantity / tier.transform_quantity_divide_by );
	} else {
		units_used = Math.ceil( currentQuantity / tier.transform_quantity_divide_by );
	}
	let price = units_used * tier.per_unit_fee;

	if ( tier.flat_fee && tier.flat_fee > 0 ) {
		price += tier.flat_fee;
	}

	const currencyDefaults = getCurrencyDefaults( state.currencyCode );
	if ( ! currencyDefaults || isNaN( price ) ) {
		return null;
	}

	// convert price from smallest unit to float (3550 to 35.50)
	return price / 10 ** currencyDefaults.precision;
}
