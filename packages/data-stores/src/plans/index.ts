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
export type { Plan, PlanSlug, PlanProduct } from './types';
export type { PlanPath } from './types';

// plansPaths is used to construct the route that accepts plan slugs like (/beginner, /business, etc..)
export {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	plansPaths,
} from './constants';

export {
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
