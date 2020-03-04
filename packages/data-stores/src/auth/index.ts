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
import { createControls } from './controls';
import * as selectors from './selectors';
import { DispatchFromMap, SelectFromMap } from '../mapped-types';
import { WpcomClientCredentials } from '../shared-types';

export * from './types';
export { State };

let isRegistered = false;
export function register( clientCreds: WpcomClientCredentials ): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			actions: publicActions,
			controls: createControls( clientCreds ) as any,
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
