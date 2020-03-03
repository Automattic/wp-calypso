/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as actions from './actions';
import { createControls } from './controls';
import * as selectors from './selectors';
import { DispatchFromMap, SelectFromMap } from '../mapped-types';
import { WpcomClientCredentials } from '../utils';

export * from './types';
export { State };

let isRegistered = false;
export function register( clientCreds: WpcomClientCredentials ): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			actions,
			controls: createControls( clientCreds ) as any,
			reducer,
			selectors,
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
