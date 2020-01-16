/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';
import wpcomProxyRequest from 'wpcom-proxy-request';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as actions from './actions';
import * as resolvers from './resolvers';
import * as selectors from './selectors';
import controls from './controls';
import { DispatchFromMap, SelectFromMap } from '../mapped-types';

export * from './types';
export { State };

const debug = debugFactory( 'data-stores:current-user' );

let isRegistered = false;
export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			actions,
			controls,
			reducer,
			resolvers,
			selectors,
		} );

		wpcomProxyRequest( { metaAPI: { accessAllUsersBlogs: true } }, ( error: object ) => {
			if ( error ) {
				throw error;
			}
			debug( 'Proxy now running in "access all user\'s blogs" mode' );
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
