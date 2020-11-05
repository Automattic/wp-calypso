/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';
import type { APIFetchOptions } from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { setFeatures, setFeaturesByType, setPlans, setPrices } from './actions';
import type { APIPlan, APIPlanDetail, PlanSlug, PlanFeature, Plan } from './types';
import {
	currenciesFormats,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	plansProductSlugs,
} from './constants';

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

export function* getPrices() {
	/* the type below (APIFetchOptions) as a blatant lie to TypeScript :D
	   the data-controls package is mistyped to demand APIFetchOptions
	   as a parameter, while APIFetchOptions is meant for `@wordpress/api-fetch`,
	   NOT for { apiFetch } from '@wordpress/data-controls'.
	*/
	const plans = yield apiFetch( {
		global: true, // needed when used in wp-admin, otherwise wp-admin will add site-prefix (search for wpcomFetchAddSitePrefix)
		url: 'https://public-api.wordpress.com/rest/v1.5/plans',
		mode: 'cors',
		credentials: 'omit',
	} as APIFetchOptions );

	// filter for supported plans
	const WPCOMPlans: APIPlan[] = plans.filter(
		( plan: APIPlan ) => -1 !== plansProductSlugs.indexOf( plan.product_slug as PlanSlug )
	);

	// create a [slug => price] map
	const prices: Record< string, string > = WPCOMPlans.reduce( ( acc, plan ) => {
		acc[ plan.product_slug ] = getMonthlyPrice( plan );
		return acc;
	}, {} as Record< string, string > );

	yield setPrices( prices );
}

const mapShortNameToProductSlug: Record< string, string > = {
	Free: PLAN_FREE,
	Personal: PLAN_PERSONAL,
	Premium: PLAN_PREMIUM,
	Business: PLAN_BUSINESS,
	eCommerce: PLAN_ECOMMERCE,
};

export function* getPlansDetails( locale = 'en' ) {
	try {
		const rawPlansDetails = yield apiFetch( {
			global: true,
			url: `https://public-api.wordpress.com/wpcom/v2/plans/details?locale=${ locale }`,
			mode: 'cors',
			credentials: 'omit',
		} as APIFetchOptions );

		const plans: Record< string, Plan > = {};
		const features: Record< string, PlanFeature > = {};

		rawPlansDetails.features.forEach( ( feature: Record< string, string > ) => {
			features[ feature.id ] = {
				id: feature.id,
				name: feature.name,
				description: feature.description,
				type: feature.type ?? 'checkbox',
			};
		} );

		rawPlansDetails.plans.forEach( ( rawPlan: APIPlanDetail ) => {
			const plan: Plan = {
				title: rawPlan.short_name,
				description: rawPlan.tagline,
				productId: rawPlan.products[ 0 ].plan_id,
				storeSlug: mapShortNameToProductSlug[ rawPlan.nonlocalized_short_name ],
				features: rawPlan.highlighted_features,
				pathSlug: rawPlan.nonlocalized_short_name?.toLowerCase(),
				featuresSlugs: rawPlan.features.reduce(
					( acc: Record< string, boolean >, cur: string ) => ( { ...acc, [ cur ]: true } ),
					{}
				),
				storage: rawPlan.storage,
			};

			if ( 'Free' === rawPlan.nonlocalized_short_name ) {
				plan.isFree = true;
			}

			if ( 'Premium' === rawPlan.nonlocalized_short_name ) {
				plan.isPopular = true;
			}

			plans[ mapShortNameToProductSlug[ rawPlan.nonlocalized_short_name ] ] = plan;
		} );

		yield setPlans( plans );
		yield setFeatures( features );
		yield setFeaturesByType( rawPlansDetails.features_by_type );
	} catch ( err ) {
		// TODO: Add error handling
		return;
	}
}
