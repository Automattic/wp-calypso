import { registerStore } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as selectors from './selectors';
export type { State };
import type { SelectFromMap, DispatchFromMap } from '../mapped-types';

export function register(): typeof STORE_KEY {
	registerStore< State >( STORE_KEY, {
		actions,
		reducer: reducer as any, // eslint-disable-line @typescript-eslint/no-explicit-any
		controls,
		selectors,
		persist: true,
	} );

	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
