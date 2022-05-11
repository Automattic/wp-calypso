import { registerStore } from '@wordpress/data';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';
import { State } from './types';
import type { DispatchFromMap, SelectFromMap } from '../mapped-types';

export * from './types';
export type { State };
export { STORE_KEY };

let isRegistered = false;
export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			actions,
			reducer,
			resolvers,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore Until createRegistrySelector is typed correctly
			selectors,
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
