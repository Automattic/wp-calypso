/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import { publicActions } from './actions';
import { createControls, ControlsConfig } from './controls';
import * as selectors from './selectors';
import { DispatchFromMap, SelectFromMap } from '../mapped-types';
import { WpcomClientCredentials } from '../shared-types';

export * from './types';
export { State };

export interface StoreConfig extends WpcomClientCredentials {
	loadCookiesAfterLogin: boolean;
}

let isRegistered = false;
export function register( config: ControlsConfig ): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			actions: publicActions,
			controls: createControls( config ) as any,
			reducer,
			selectors,
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof publicActions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
