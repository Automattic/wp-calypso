import { register, createReduxStore } from '@wordpress/data';
import { createActions } from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducers';
import * as selectors from './selectors';
export * from './types';
export type { State };

export const store = createReduxStore( STORE_KEY, {
	actions: createActions(),
	reducer,
	selectors,
} );

register( store );
