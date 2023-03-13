import { registerStore } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as selectors from './selectors';
import type { WpcomPlansUIAction } from './actions';
import type { Reducer } from 'redux';

export type { State };

let isRegistered = false;

export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore( STORE_KEY, {
			actions,
			controls,
			reducer: reducer as Reducer< State, WpcomPlansUIAction >,
			selectors,
		} );
	}
	return STORE_KEY;
}
