import { plugins, registerStore, use } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import persistOptions from '../one-week-persistence-config';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as selectors from './selectors';
import type { SelectFromMap, DispatchFromMap } from '../mapped-types';

export type { State };

export function register(): typeof STORE_KEY {
	use( plugins.persistence, persistOptions );

	registerStore< State >( STORE_KEY, {
		actions,
		controls,
		reducer: reducer as any, // eslint-disable-line @typescript-eslint/no-explicit-any
		selectors,
		persist: [ 'stepData' ],
	} );

	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
