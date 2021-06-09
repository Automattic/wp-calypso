/**
 * External dependencies
 */
import { plugins, registerStore, use } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as resolvers from './resolvers';
import * as actions from './actions';
import * as selectors from './selectors';
import persistOptions from './persist';
import type { SelectFromMap, DispatchFromMap } from '../mapped-types';
import { controls } from '../wpcom-request-controls';

export type { State };
export { STORE_KEY };

use( plugins.persistence, persistOptions );

let isRegistered = false;

export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			actions,
			controls: controls as any,
			reducer: reducer as any,
			resolvers,
			selectors,
			persist: [ 'teams' ],
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
