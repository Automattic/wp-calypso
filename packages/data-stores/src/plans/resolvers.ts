/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';
import type { APIFetchOptions } from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { supportedPlanSlugs } from './reducer';
import { setPrices } from './actions';
import type { APIPlan, PlanSlug } from './types';
import { currenciesFormats } from './constants';

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
		( plan: APIPlan ) => -1 !== supportedPlanSlugs.indexOf( plan.product_slug as PlanSlug )
	);

	// create a [slug => price] map
	const prices: Record< string, string > = WPCOMPlans.reduce( ( acc, plan ) => {
		acc[ plan.product_slug ] = getMonthlyPrice( plan );
		return acc;
	}, {} as Record< string, string > );

	yield setPrices( prices );
}
