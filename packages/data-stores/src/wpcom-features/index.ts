/**
 * External dependencies
 */
import { controls } from '@wordpress/data-controls';
import { registerStore } from '@wordpress/data';
import type { Reducer, AnyAction } from 'redux';
import type { SelectFromMap, DispatchFromMap } from '../mapped-types';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';

export type { State };
export type { FeatureId, Feature } from './types';

export { featuresList } from './features-data';

let isRegistered = false;

export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			actions,
			controls,
			reducer: reducer as Reducer< State, AnyAction >,
			selectors,
			persist: true,
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
