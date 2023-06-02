import { registerStore } from '@wordpress/data';
import { controls } from '../wpcom-request-controls';
import { createActions } from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import { createResolvers } from './resolvers';
import * as selectors from './selectors';
import type { WpcomClientCredentials } from '../shared-types';

export * from './types';
export type { State };

let isRegistered = false;
export function register( clientCreds: WpcomClientCredentials ): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore( STORE_KEY, {
			actions: createActions( clientCreds ),
			controls,
			reducer,
			resolvers: createResolvers( clientCreds ),
			selectors,
		} );
	}
	return STORE_KEY;
}
