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
	currenciesFormats,
	TIMELESS_PLAN_FREE,
	TIMELESS_PLAN_PREMIUM,
	plansProductSlugs,
	monthlySlugs,
	annualSlugs,
} from './constants';
import { fetchAndParse, wpcomRequest } from '../wpcom-request-controls';

const MONTHLY_PLAN_BILLING_PERIOD = 31;

/**
 * Calculates the monthly price of a plan
 * All supported plans are priced yearly
 *
 * @param plan the plan object
 */
function getMonthlyPrice( plan: PricedAPIPlan ) {
	const currency = currenciesFormats[ plan.currency_code ];
	let price: number | string = plan.raw_price / 12;

	// if the number isn't an integer, follow the API rule for rounding it
	if ( ! Number.isInteger( price ) ) {
		price = price.toFixed( currency.decimal );
	}

	if ( currency.format === 'AMOUNT_THEN_SYMBOL' ) {
		return `${ price }${ currency.symbol }`;
	}
	// else
	return `${ currency.symbol }${ price }`;
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
			pathSlug: planProduct.path_slug,
			price:
				planProduct?.bill_period === MONTHLY_PLAN_BILLING_PERIOD || planProduct.raw_price === 0
					? planProduct.formatted_price
					: getMonthlyPrice( planProduct ),
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
