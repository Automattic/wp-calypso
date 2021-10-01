import { registerStore } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as selectors from './selectors';
import type { SelectFromMap } from '../mapped-types';
import type { Reducer, AnyAction } from 'redux';

export type { State };
export type { FeatureId, Feature } from './types';

export { featuresList } from './features-data';

let isRegistered = false;

export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			controls,
			reducer: reducer as Reducer< State, AnyAction >,
			selectors,
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
