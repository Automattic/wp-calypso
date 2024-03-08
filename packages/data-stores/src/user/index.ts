import { registerStore } from '@wordpress/data';
import { controls } from '../wpcom-request-controls';
import { createActions } from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import { createResolvers } from './resolvers';
import * as selectors from './selectors';

export * from './types';
export type { State };

let isRegistered = false;
export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore( STORE_KEY, {
			actions: createActions(),
			controls,
			reducer,
			resolvers: createResolvers(),
			selectors,
		} );
	}
	return STORE_KEY;
}
