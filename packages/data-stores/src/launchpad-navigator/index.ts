import { register, createReduxStore } from '@wordpress/data';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer from './reducer';
import * as selectors from './selectors';

export const store = createReduxStore( STORE_KEY, {
	actions,
	reducer,
	selectors,
} );

register( store );
