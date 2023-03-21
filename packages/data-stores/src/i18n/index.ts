import { createReduxStore, register } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';

export type { State };
export type { LocalizedLanguageNames } from './types';

export const store = createReduxStore( STORE_KEY, {
	resolvers,
	actions,
	controls,
	reducer,
	selectors,
} );

register( store );
