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
export type { Plan, PlanSlug } from './types';
export type { PlanPath } from './constants';

// plansPaths is used to construct the route that accepts plan slugs like (/beginner, /business, etc..)
export {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	plansPaths,
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
