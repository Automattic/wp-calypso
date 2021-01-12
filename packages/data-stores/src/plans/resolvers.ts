/**
 * External dependencies
 */
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import { setFeatures, setFeaturesByType, setPlans, setPrices } from './actions';
import type { APIPlan, APIPlanDetail, PlanSlug, PlanFeature, Plan } from './types';
import {
	currenciesFormats,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_MONTHLY,
	plansProductSlugs,
	billedMonthlySlugs,
} from './constants';
import { fetchAndParse, wpcomRequest } from '../wpcom-request-controls';

/**
 * Calculates the monthly price of a plan
 * All supported plans are priced yearly
 *
 * @param plan the plan object
 */
function getMonthlyPrice( plan: APIPlan ) {
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

export function* getPrices( locale = 'en' ) {
	const plans = yield wpcomRequest( {
		path: '/plans',
		query: stringify( { locale } ),
		apiVersion: '1.5',
	} );

	// filter for supported plans
	const WPCOMPlans: APIPlan[] = plans.filter(
		( plan: APIPlan ) => -1 !== plansProductSlugs.indexOf( plan.product_slug as PlanSlug )
	);

	// create a [slug => price] map
	const prices: Record< string, string > = WPCOMPlans.reduce( ( acc, plan ) => {
		if ( plan.bill_period === 31 ) {
			acc[ plan.product_slug ] = plan.formatted_price;
		} else {
			// Calculate the monthly price of yearly-billed plans
			acc[ plan.product_slug ] = getMonthlyPrice( plan );
		}
		return acc;
	}, {} as Record< string, string > );

	yield setPrices( prices );
}

const mapProductSlugToShortName: Record< string, string > = {
	[ PLAN_FREE ]: 'Free',
	[ PLAN_PERSONAL ]: 'Personal',
	[ PLAN_PERSONAL_MONTHLY ]: 'Personal',
	[ PLAN_PREMIUM ]: 'Premium',
	[ PLAN_PREMIUM_MONTHLY ]: 'Premium',
	[ PLAN_BUSINESS ]: 'Business',
	[ PLAN_BUSINESS_MONTHLY ]: 'Business',
	[ PLAN_ECOMMERCE ]: 'eCommerce',
	[ PLAN_ECOMMERCE_MONTHLY ]: 'eCommerce',
};

export function* getPlansDetails( locale = 'en' ) {
	try {
		const { body: rawPlansDetails } = yield fetchAndParse(
			`https://public-api.wordpress.com/wpcom/v2/plans/details?locale=${ encodeURIComponent(
				locale
			) }`,
			{
				mode: 'cors',
				credentials: 'omit',
			}
		);

		const features: Record< string, PlanFeature > = {};

		rawPlansDetails.features.forEach( ( feature: Record< string, string > ) => {
			features[ feature.id ] = {
				id: feature.id,
				name: feature.name,
				description: feature.description,
				type: feature.type ?? 'checkbox',
			};
		} );

		const plans: Record< string, Plan > = plansProductSlugs.reduce( ( plans, slug ) => {
			const rawPlan = rawPlansDetails.plans.find(
				( plan: APIPlanDetail ) =>
					plan.nonlocalized_short_name === mapProductSlugToShortName[ slug ]
			);

			if ( ! rawPlan ) {
				return plans;
			}

			const plan: Plan = {
				title: rawPlan.short_name,
				description: rawPlan.tagline,
				productId: rawPlan.products[ 0 ].plan_id,
				storeSlug: slug,
				features: rawPlan.highlighted_features,
				pathSlug: rawPlan.nonlocalized_short_name?.toLowerCase(),
				featuresSlugs: rawPlan.features.reduce(
					( acc: Record< string, boolean >, cur: string ) => ( { ...acc, [ cur ]: true } ),
					{}
				),
				storage: rawPlan.storage,
				isFree: 'Free' === rawPlan.nonlocalized_short_name,
				isPopular: 'Premium' === rawPlan.nonlocalized_short_name,
				billPeriod: billedMonthlySlugs.indexOf( slug as never ) > -1 ? 31 : 365,
			};

			plans[ slug ] = plan;

			return plans;
		}, {} as Record< string, Plan > );

		yield setPlans( plans );
		yield setFeatures( features );
		yield setFeaturesByType( rawPlansDetails.features_by_type );
	} catch ( err ) {
		// TODO: Add error handling
		return;
	}
}
