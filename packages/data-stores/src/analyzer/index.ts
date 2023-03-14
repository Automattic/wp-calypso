import { registerStore } from '@wordpress/data';
import { controls } from '../wpcom-request-controls';
import { createActions } from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducers';
import * as selectors from './selectors';
export * from './types';
export type { State };

let isRegistered = false;
export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore( STORE_KEY, {
			actions: createActions(),
			controls: controls,
			reducer: reducer,
			selectors,
		} );
	}
	return STORE_KEY;
}
