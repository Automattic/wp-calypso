/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';
import type { APIFetchOptions } from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { setFeatures, setFeaturesByType, setPlans, setPrices } from './actions';
import type { APIPlan, PlanSlug, PlanDetail, PlanFeature, Plan } from './types';
import {
	currenciesFormats,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
} from './constants';
import { PLANS_LIST } from './plans-data';

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
		( plan: APIPlan ) => -1 !== Object.keys( PLANS_LIST ).indexOf( plan.product_slug as PlanSlug )
	);

	// create a [slug => price] map
	const prices: Record< string, string > = WPCOMPlans.reduce( ( acc, plan ) => {
		acc[ plan.product_slug ] = getMonthlyPrice( plan );
		return acc;
	}, {} as Record< string, string > );

	yield setPrices( prices );
}

const mapPlanSlugToProductSlug: Record< string, string > = {
	free: PLAN_FREE,
	personal: PLAN_PERSONAL,
	premium: PLAN_PREMIUM,
	business: PLAN_BUSINESS,
	ecommerce: PLAN_ECOMMERCE,
};

export function* getPlansDetails( locale = 'en' ) {
	try {
		const rawPlansDetails = yield apiFetch( {
			global: true,
			url: `https://public-api.wordpress.com/wpcom/v2/plans/details?locale=${ locale }`,
			mode: 'cors',
			credentials: 'omit',
		} as APIFetchOptions );

		// const plansDetails: PlanDetails = [];
		const plans: Record< string, Plan > = {};

		const generalFeatures: PlanDetail = {
			id: 'general',
			name: null,
			features: [],
		};

		const features: Record< string, PlanFeature > = {};

		rawPlansDetails.features.forEach( ( feature: Record< string, string > ) => {
			generalFeatures.features.push( {
				id: feature.id,
				name: feature.name,
				description: feature.description,
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			} );

			features[ feature.id ] = {
				id: feature.id,
				name: feature.name,
				description: feature.description,
			};
		} );

		rawPlansDetails.plans.forEach( ( rawPlan: any ) => {
			const plan: Plan = {
				title: rawPlan.short_name,
				description: rawPlan.tagline,
				productId: rawPlan.products[ 0 ].plan_id,
				storeSlug: mapPlanSlugToProductSlug[ rawPlan.path_slug ],
				pathSlug: rawPlan.path_slug,
				features: rawPlan.highlighted_features,
				featuresSlugs: rawPlan.features.reduce(
					( acc: Record< string, boolean >, cur: string ) => ( { ...acc, [ cur ]: true } )
				),
			};

			if ( 'free' === rawPlan.path_slug ) {
				plan.isFree = true;
			}

			if ( 'premium' === rawPlan.path_slug ) {
				plan.isPopular = true;
			}

			plans[ mapPlanSlugToProductSlug[ rawPlan.path_slug ] ] = plan;
			// export const PLANS_LIST: Record< string, Plan > = {
			// 	[ PLAN_FREE ]: {
			// 		title: translate( 'Free' ) as string,
			// 		description: translate( 'Create a beautiful, simple website in minutes' ) as string,
			// 		productId: 1,
			// 		storeSlug: PLAN_FREE,
			// 		pathSlug: 'beginner',
			// 		features: [ '3 GB storage space' ],
			// 		isFree: true,
			// 	},

			// 	[ PLAN_PERSONAL ]: {
			// 		title: translate( 'Personal' ) as string,
			// 		description: translate( 'Best for personal use' ) as string,
			// 		productId: 1009,
			// 		storeSlug: PLAN_PERSONAL,
			// 		pathSlug: 'personal',
			// 		features: [ '6 GB storage space', ...mainFeatures.slice( 0, 3 ) ],
			// 	},

			// 	[ PLAN_PREMIUM ]: {
			// 		title: translate( 'Premium' ) as string,
			// 		description: translate( 'Best for freelancers' ) as string,
			// 		productId: 1003,
			// 		storeSlug: PLAN_PREMIUM,
			// 		pathSlug: 'premium',
			// 		features: [ '13 GB storage space', ...mainFeatures.slice( 0, 8 ) ],
			// 		isPopular: true,
			// 	},
		} );

		// plansDetails.push( generalFeatures );
		// yield setPlansDetails( plansDetails );

		yield setPlans( plans );
		yield setFeatures( features );
		yield setFeaturesByType( rawPlansDetails.features_by_type );
	} catch ( err ) {
		console.log( 'there was an error' );
		console.log( err );
		return;
	}
}
