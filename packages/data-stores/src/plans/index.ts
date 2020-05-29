/**
 * External dependencies
 */
import { controls } from '@wordpress/data-controls';
import { plugins, registerStore, use } from '@wordpress/data';
import type { SelectFromMap, DispatchFromMap } from '../mapped-types';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';
import * as resolvers from './resolvers';
import { plansPaths } from './plans-data';
import persistOptions from './persist';
import type { Plan, PlanSlug } from './types';

let isRegistered = false;

export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		use( plugins.persistence, persistOptions );

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

export type { Plan, PlanSlug };
export type State = import('./reducer').State;

// used to construct the route that accepts plan slugs like (/beginner, /business, etc..)
export { plansPaths };
