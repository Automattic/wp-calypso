import { createReduxStore, register } from '@wordpress/data';
import reducer from './reducer';
import * as selectors from './selectors';
import * as actions from './actions';

export const STORE_NAME = 'a8c-agenttic-ui';

export const store = createReduxStore( STORE_NAME, {
	reducer,
	selectors,
	actions,
} );

let isRegistered = false;

export const registerStore = () => {
	if ( ! isRegistered ) {
		register( store );
		isRegistered = true;
		console.log( 'Store registered:', STORE_NAME );
	}
	return store;
};

export * from './types';
export * from './selectors';
export * from './actions';
