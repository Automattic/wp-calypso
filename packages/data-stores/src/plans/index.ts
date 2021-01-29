/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';
import type { SelectFromMap, DispatchFromMap } from '../mapped-types';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';
import * as resolvers from './resolvers';
import { controls } from '../wpcom-request-controls';

export type { State };
export type {
	Plan,
	PlanSlug,
	StorePlanSlug,
	PlanProduct,
	PlanFeature,
	PlanPath,
	PlanBillingPeriod,
	PlanSimplifiedFeature,
} from './types';

// plansSlugs is a list with the identifiers for each plan and they are agnostic of billing period; eg: 'free', 'personal'
// plansSlugs is also used to construct the route that accepts plan slugs like '/free', '/personal', '/business'
// plansProductSlugs is a list with the identifiers for each plan product (including the billing period); eg: 'personal-bundle', 'personal-bundle-monthly'
// TIMELESS_* is the slug for each plan
export {
	plansSlugs,
	plansProductSlugs,
	TIMELESS_PLAN_FREE,
	TIMELESS_PLAN_PERSONAL,
	TIMELESS_PLAN_PREMIUM,
	TIMELESS_PLAN_BUSINESS,
	TIMELESS_PLAN_ECOMMERCE,
} from './constants';

let isRegistered = false;

export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			resolvers,
			actions,
			controls: controls as any,
			reducer: reducer as any,
			selectors,
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
