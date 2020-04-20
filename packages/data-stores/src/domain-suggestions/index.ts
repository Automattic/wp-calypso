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
import * as resolvers from './resolvers';
import createSelectors, { Selectors } from './selectors';
import { DispatchFromMap, SelectFromMap } from '../mapped-types';
import { controls } from '../wpcom-request-controls';

export * from './types';
export { State };

let isRegistered = false;
interface StoreConfiguration {
	/**
	 * The default vendor to pass to domain queries.
	 * Can be overridden in individual queries.
	 */
	vendor: string;
}
export function register( { vendor }: StoreConfiguration ): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			actions,
			controls: controls as any,
			reducer: reducer as any,
			resolvers,
			selectors: createSelectors( vendor ),
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< Selectors >;
}
