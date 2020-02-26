/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';
import { WpcomClientCredentials } from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';
import createControls from './controls';
import { DispatchFromMap, SelectFromMap } from '../mapped-types';

export * from './types';
export { State };

let isRegistered = false;
export function register( clientCreds: WpcomClientCredentials ): typeof STORE_KEY {
	if ( ! isRegistered ) {
		const controls = createControls( clientCreds );
		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			actions,
			controls: controls as any,
			reducer: reducer as any,
			resolvers: {},
			selectors,
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
