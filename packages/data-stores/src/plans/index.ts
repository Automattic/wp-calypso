/**
 * External dependencies
 */
import { controls } from '@wordpress/data-controls';
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

export type { State };
export type { Plan, PlanSlug } from './types';

// used to construct the route that accepts plan slugs like (/beginner, /business, etc..)
export { plansPaths } from './plans-data';

let isRegistered = false;

export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			resolvers,
			actions,
			controls,
			reducer: reducer as any,
			selectors,
			persist: [ 'selectedPlanSlug' ],
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
