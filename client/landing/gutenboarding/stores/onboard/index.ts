/**
 * External dependencies
 */
import { controls } from '@wordpress/data-controls';
import { plugins, registerStore, use } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';
import * as resolvers from './resolvers';
import { SelectFromMap, DispatchFromMap } from '../mapped-types';

export { STORE_KEY };

use( plugins.persistence, {} );

registerStore< State >( STORE_KEY, {
	actions,
	controls,
	reducer,
	resolvers,
	selectors,
	persist: [ 'siteTitle', 'siteType', 'siteVertical' ],
} );

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
