import { register, createReduxStore } from '@wordpress/data';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer from './reducer';
import * as resolvers from './resolvers';
import { State } from './types';
export * from './utilities';

export * from './types';
export type { State };
export { STORE_KEY };

export const store = createReduxStore( STORE_KEY, {
	actions,
	reducer,
	resolvers,
	selectors: {
		getAutomatedTransferEligibility: ( state: State, siteId: number | null ) =>
			siteId && state[ siteId ] ? state[ siteId ] : null,
	},
} );
register( store );
