/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { setPrices, setFeatures, setSupportedPlans } from './actions';
import { PricesAPIPlan, Plan, Slug } from './types';
import {
	currenciesFormats,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
} from './constants';

const slugs: Slug[] = [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE ];

/**
 * Calculates the monthly price of a plan
 * All supported plans are priced yearly
 *
 * @param plan the plan object
 */
function getMonthlyPrice( plan: PricesAPIPlan ) {
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
	const plans = yield apiFetch( {
		path: 'https://public-api.wordpress.com/rest/v1.5/plans',
		mode: 'cors',
		credentials: 'omit',
	} );

	// filter for supported plans
	const WPCOMPlans: PricesAPIPlan[] = plans.filter( ( plan: PricesAPIPlan ) =>
		slugs.includes( plan.product_slug )
	);

	// create a [slug => price] map
	const prices: Record< string, string > = WPCOMPlans.reduce( ( acc, plan ) => {
		acc[ plan.product_slug ] = getMonthlyPrice( plan );
		return acc;
	}, {} as Record< string, string > );

	yield setPrices( prices );
}

export function* getSupportedPlans() {
	const { plans, features } = yield apiFetch( {
		path: 'https://public-api.wordpress.com/wpcom/v2/plans/mobile',
		mode: 'cors',
		credentials: 'omit',
	} );

	/* create a [slug => Plan] mapping */
	const supportedPlans = plans.reduce(
		( acc: Record< string, Plan >, plan: Plan, index: number ) => {
			acc[ slugs[ index ] ] = plan;

			// @TODO: send a patch to the API to add the slug
			plan.slug = slugs[ index ];
			return acc;
		},
		{}
	);

	yield setFeatures( features );
	yield setSupportedPlans( supportedPlans );
}
