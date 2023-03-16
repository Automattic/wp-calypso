import { register, createReduxStore } from '@wordpress/data';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';
import { State } from './types';

export * from './types';
export type { State };
export { STORE_KEY };

export const store = createReduxStore( STORE_KEY, {
	actions,
	reducer,
	resolvers,
	selectors,
} );
register( store );
