import { registerStore } from '@wordpress/data';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';
import { State } from './types';

export * from './types';
export type { State };
export { STORE_KEY };

let isRegistered = false;
export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore( STORE_KEY, {
			actions,
			reducer,
			resolvers,
			selectors,
		} );
	}
	return STORE_KEY;
}
