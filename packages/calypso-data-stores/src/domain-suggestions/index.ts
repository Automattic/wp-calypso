/**
 * External dependencies
 */
import { controls } from '@wordpress/data-controls';
import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as actions from './actions';
import * as resolvers from './resolvers';
import * as selectors from './selectors';
import { DispatchFromMap, SelectFromMap } from '../mapped-types';
import * as types from './types';

export { State, STORE_KEY, types };

export function register() {
	registerStore< State >( STORE_KEY, { actions, controls, reducer, resolvers, selectors } );
}

declare module '@wordpress/data' {
	function dispatch(
		key: typeof import('./constants').STORE_KEY
	): DispatchFromMap< typeof actions >;
	function select( key: typeof import('./constants').STORE_KEY ): SelectFromMap< typeof selectors >;
}
