/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import { createActions } from './actions';
import * as resolvers from './resolvers';
import * as selectors from './selectors';
import type { DispatchFromMap, SelectFromMap } from '../mapped-types';
import type { WpcomClientCredentials } from '../shared-types';
import { controls } from '../wpcom-request-controls';

export * from './types';
export type { State };

let isRegistered = false;
export function register( clientCreds: WpcomClientCredentials ): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			actions: createActions( clientCreds ),
			controls: controls as any,
			reducer,
			resolvers,
			selectors,
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< ReturnType< typeof createActions > >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
