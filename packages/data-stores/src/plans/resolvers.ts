/**
 * External dependencies
 */
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import { setFeatures, setFeaturesByType, setPlanProducts, setPlans } from './actions';
import type {
	PricedAPIPlan,
	Plan,
	DetailsAPIResponse,
	PlanFeature,
	PlanProduct,
	Feature,
} from './types';
import {
	TIMELESS_PLAN_FREE,
	TIMELESS_PLAN_PREMIUM,
	plansProductSlugs,
	monthlySlugs,
	annualSlugs,
} from './constants';
import { fetchAndParse, wpcomRequest } from '../wpcom-request-controls';
import formatCurrency from '@automattic/format-currency';

const MONTHLY_PLAN_BILLING_PERIOD = 31;

/**
 * Calculates the monthly price of a plan
 * Annual plans are only priced yearly
 *
 * @param plan the plan object
 */
function getMonthlyPrice( plan: PricedAPIPlan ) {
	return formatCurrency( plan.raw_price / 12, plan.currency_code, { stripZeros: true } ) as string;
}

/**
 * Calculates the yearly price of a monthly plan
 *
 * @param plan the plan object
 */
function getAnnualPrice( plan: PricedAPIPlan ) {
	return formatCurrency( plan.raw_price * 12, plan.currency_code, { stripZeros: true } ) as string;
}

/**
 * Formats the plan price according to 'format-currency' package rules
 * We use this for consistency in prices formats across monthly and annual plans
 *
 * @param plan the plan object
 */
function getFormattedPrice( plan: PricedAPIPlan ) {
	return formatCurrency( plan.raw_price, plan.currency_code, { stripZeros: true } ) as string;
}

function calculateDiscounts( planProducts: PlanProduct[] ) {
	// calculate discounts
	for ( let i = 0; i < annualSlugs.length; i++ ) {
		const annualPlan = planProducts.find( ( plan ) => plan.storeSlug === annualSlugs[ i ] );
		const monthlyPlan = planProducts.find( ( plan ) => plan.storeSlug === monthlySlugs[ i ] );

		if ( annualPlan && monthlyPlan ) {
			const annualCostIfPaidMonthly = monthlyPlan.rawPrice * 12;
			const annualCostIfPaidAnnually = annualPlan.rawPrice;
			const discount = Math.round(
				100 * ( 1 - annualCostIfPaidAnnually / annualCostIfPaidMonthly )
			);
			annualPlan.annualDiscount = discount;
			monthlyPlan.annualDiscount = discount;
		}
	}
}

function processFeatures( features: Feature[] ) {
	return features.reduce( ( features, feature ) => {
		features[ feature.id ] = {
			id: feature.id,
			name: feature.name,
			description: feature.description,
			type: feature.type ?? 'checkbox',
		};
		return features;
	}, {} as Record< string, PlanFeature > );
}

function normalizePlanProducts(
	pricedPlans: PricedAPIPlan[],
	periodAgnosticPlans: Plan[]
): PlanProduct[] {
	const plansProducts: PlanProduct[] = plansProductSlugs.reduce( ( plans, slug ) => {
		const planProduct = pricedPlans.find(
			( pricedPlan ) => pricedPlan.product_slug === slug
		) as PricedAPIPlan;

		if ( ! planProduct ) {
			return plans;
		}

		const periodAgnosticPlan = periodAgnosticPlans.find(
			( plan ) => plan.productIds.indexOf( planProduct.product_id ) > -1
		) as Plan;

		plans.push( {
			productId: planProduct.product_id,
			billingPeriod:
				planProduct.bill_period === MONTHLY_PLAN_BILLING_PERIOD ? 'MONTHLY' : 'ANNUALLY',
			periodAgnosticSlug: periodAgnosticPlan.periodAgnosticSlug,
			storeSlug: planProduct.product_slug,
			rawPrice: planProduct.raw_price,
			pathSlug: planProduct.product_slug === 'free_plan' ? 'free' : planProduct.path_slug,
			price:
				planProduct?.bill_period === MONTHLY_PLAN_BILLING_PERIOD || planProduct.raw_price === 0
					? getFormattedPrice( planProduct )
					: getMonthlyPrice( planProduct ),
			annualPrice:
				planProduct?.bill_period === MONTHLY_PLAN_BILLING_PERIOD
					? getAnnualPrice( planProduct )
					: getFormattedPrice( planProduct ),
		} );
		return plans;
	}, [] as PlanProduct[] );
	calculateDiscounts( plansProducts );
	return plansProducts;
}

export function* getSupportedPlans( locale = 'en' ) {
	const pricedPlans: PricedAPIPlan[] = yield wpcomRequest( {
		path: '/plans',
		query: stringify( { locale } ),
		apiVersion: '1.5',
	} );

	const { body: plansFeatures } = ( yield fetchAndParse(
		`https://public-api.wordpress.com/wpcom/v2/plans/details?locale=${ encodeURIComponent(
			locale
		) }`,
		{
			mode: 'cors',
			credentials: 'omit',
		}
	) ) as { body: DetailsAPIResponse };

	const periodAgnosticPlans: Plan[] = plansFeatures.plans.map( ( plan ) => {
		return {
			description: plan.tagline,
			features: plan.highlighted_features,
			storage: plan.storage,
			title: plan.short_name,
			featuresSlugs: plan.features.reduce( ( slugs, slug ) => {
				slugs[ slug ] = true;
				return slugs;
			}, {} as Record< string, boolean > ),
			isFree: plan.nonlocalized_short_name === TIMELESS_PLAN_FREE,
			isPopular: plan.nonlocalized_short_name === TIMELESS_PLAN_PREMIUM,
			periodAgnosticSlug: plan.nonlocalized_short_name,
			productIds: plan.products.map( ( { plan_id } ) => plan_id ),
		};
	} );

	const planProducts = normalizePlanProducts( pricedPlans, periodAgnosticPlans );
	const features = processFeatures( plansFeatures.features );

	yield setPlans( periodAgnosticPlans );
	yield setPlanProducts( planProducts );
	yield setFeatures( features );
	yield setFeaturesByType( plansFeatures.features_by_type );
}
