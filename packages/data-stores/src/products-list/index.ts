import { createReduxStore, register } from '@wordpress/data';
import { controls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';

export * from './types';
export type { State };
export { STORE_KEY };

export const store = createReduxStore( STORE_KEY, {
	actions,
	controls,
	reducer,
	resolvers,
	selectors,
} );

/** Queries */
export { default as useProducts } from './queries/use-products';

register( store );
