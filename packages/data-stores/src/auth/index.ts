/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';
import { controls as dataControls } from '@wordpress/data-controls';
import { requestAllBlogsAccess } from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import { createActions, ActionsConfig } from './actions';
import { controls } from './controls';
import * as selectors from './selectors';
import type { DispatchFromMap, SelectFromMap } from '../mapped-types';
import { controls as wpcomRequestControls } from '../wpcom-request-controls';

export * from './types';
export type { State };

let isRegistered = false;
export function register( config: ActionsConfig ): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;

		requestAllBlogsAccess().catch( () => {
			throw new Error( 'Could not get all blog access.' );
		} );

		registerStore< State >( STORE_KEY, {
			actions: createActions( config ),
			controls: {
				...controls,
				...dataControls,
				...wpcomRequestControls,
			} as any,
			reducer,
			selectors,
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< ReturnType< typeof createActions > >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
