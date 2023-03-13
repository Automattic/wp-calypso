import { registerStore } from '@wordpress/data';
import { controls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';

export * from './types';
export type { State };
export { STORE_KEY };

let isRegistered = false;
export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore( STORE_KEY, {
			actions,
			controls,
			reducer,
			resolvers,
			selectors,
		} );
	}
	return STORE_KEY;
}
