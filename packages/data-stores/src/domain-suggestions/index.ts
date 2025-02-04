import { register, createReduxStore } from '@wordpress/data';
import { controls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';

export * from './types';
export * from './constants';
export * from './queries';
export { getFormattedPrice } from './utils';
export type { State };

export const store = createReduxStore( STORE_KEY, {
	actions,
	controls,
	reducer,
	resolvers,
	selectors,
} );
register( store );
