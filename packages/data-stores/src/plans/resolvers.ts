/**
 * External dependencies
 */
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import { setFeatures, setFeaturesByType, setPlans } from './actions';
import type {
	PricedAPIPlan,
	APIPlanDetail,
	PlanSlug,
	Plan,
	DetailsAPIResponse,
	PlanFeature,
} from './types';
import {
	currenciesFormats,
	PLAN_PREMIUM,
	PLAN_PREMIUM_MONTHLY,
	plansProductSlugs,
	billedMonthlySlugs,
	billedYearlySlugs,
	PLAN_FREE,
} from './constants';
import { fetchAndParse, wpcomRequest } from '../wpcom-request-controls';

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

export function* getSupportedPlans( locale = 'en' ) {
	const planPrices: PricedAPIPlan[] = yield wpcomRequest( {
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

	const plans = plansProductSlugs.reduce( ( plans, slug ) => {
		const pricedPlan = planPrices.find(
			( pricedPlan ) => pricedPlan.product_slug === slug
		) as PricedAPIPlan;

		if ( ! pricedPlan ) {
			return plans;
		}

		// each details objects has a products[] array containing all the plans' ID it covers
		// Here we find the right details object using this product id array
		const {
			features: planFeaturesSlugs,
			...planDetails
		} = plansFeatures.plans.find( ( planDetails ) =>
			planDetails.products.find( ( product ) => product.plan_id === pricedPlan.product_id )
		) as APIPlanDetail;

		plans[ slug ] = {
			description: planDetails.tagline,
			features: planDetails.highlighted_features,
			storage: planDetails.storage,
			title: pricedPlan.product_name_short,
			productId: pricedPlan.product_id,
			storeSlug: slug,
			pathSlug: pricedPlan.path_slug,
			featuresSlugs: planFeaturesSlugs.reduce( ( slugs, slug ) => {
				slugs[ slug ] = true;
				return slugs;
			}, {} as Record< string, boolean > ),
			isFree: pricedPlan.raw_price === 0,
			isPopular: slug === PLAN_PREMIUM || slug === PLAN_PREMIUM_MONTHLY,
			// useful to detect when the selected plan's period doesn't match the preferred interval
			rawPrice: pricedPlan.raw_price,
			price:
				pricedPlan?.bill_period === 31 ? pricedPlan.formatted_price : getMonthlyPrice( pricedPlan ),
		};
		// only add billPeriod for paid plans
		if ( slug !== PLAN_FREE ) {
			plans[ slug ].billPeriod = pricedPlan.bill_period === 31 ? 'MONTHLY' : 'ANNUALLY';
		}

		return plans;
	}, {} as Record< PlanSlug, Plan > );

	// calculate discounts
	for ( let i = 0; i < billedYearlySlugs.length; i++ ) {
		const annualPlan = plans[ billedYearlySlugs[ i ] ];
		const monthlyPlan = plans[ billedMonthlySlugs[ i ] ];

		if ( annualPlan && monthlyPlan ) {
			const annualCostIfPaidMonthly = monthlyPlan.rawPrice * 12;
			const annualCostIfPaidAnnually = annualPlan.rawPrice;
			const discount = Math.round(
				100 * ( 1 - annualCostIfPaidAnnually / annualCostIfPaidMonthly )
			);
			plans[ billedYearlySlugs[ i ] ].annualDiscount = discount;
			plans[ billedYearlySlugs[ i ] ].annualDiscount = discount;
		}
	}

	const features = plansFeatures.features.reduce( ( features, feature ) => {
		features[ feature.id ] = {
			id: feature.id,
			name: feature.name,
			description: feature.description,
			type: feature.type ?? 'checkbox',
		};
		return features;
	}, {} as Record< string, PlanFeature > );

	yield setFeatures( features );
	yield setFeaturesByType( plansFeatures.features_by_type );
	yield setPlans( plans );
}
