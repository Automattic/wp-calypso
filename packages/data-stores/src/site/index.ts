import { plugins, use, registerStore } from '@wordpress/data';
import persistOptions from '../one-week-persistence-config';
import { controls } from '../wpcom-request-controls';
import { createActions } from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';
import type { DispatchFromMap, SelectFromMap } from '../mapped-types';
import type { WpcomClientCredentials } from '../shared-types';

export * from './types';
export type { State };
export { STORE_KEY };

let isRegistered = false;
export function register( clientCreds: WpcomClientCredentials ): typeof STORE_KEY {
	if ( ! isRegistered ) {
		use( plugins.persistence, persistOptions );

		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			actions: createActions( clientCreds ),
			controls: controls as any,
			reducer,
			resolvers,
			selectors,
			persist: [ 'bundledPluginSlug' ],
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< ReturnType< typeof createActions > >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
