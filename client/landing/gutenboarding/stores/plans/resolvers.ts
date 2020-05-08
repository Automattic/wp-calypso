/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';

import { supportedPlanSlugs } from './reducer';

/**
 * Internal dependencies
 */
import { setPrices } from './actions';
import { APIPlan } from './types';

export function* getPrices() {
	const plans = yield apiFetch( {
		path: 'https://public-api.wordpress.com/rest/v1.5/plans',
		mode: 'cors',
		credentials: 'omit',
	} );

	// filter for supported plans
	const WPCOMPlans: APIPlan[] = plans.filter( ( plan: APIPlan ) =>
		supportedPlanSlugs.includes( plan.product_slug )
	);

	// create a [slug => price] map
	const prices: Record< string, string > = WPCOMPlans.reduce( ( acc, plan ) => {
		acc[ plan.product_slug ] = plan.formatted_price;
		return acc;
	}, {} as Record< string, string > );

	yield setPrices( prices );
}
