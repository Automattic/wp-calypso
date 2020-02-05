/**
 * External dependencies
 */
import { plugins, registerStore, use } from '@wordpress/data';
import { isSupportSession } from 'lib/user/support-user-interop';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';
import persistOptions from './persist';
import { SelectFromMap, DispatchFromMap } from '@automattic/data-stores';

export { STORE_KEY };

// Define the conditions under which data should be persisted to localStorage
export const shouldPersist = () => {
	const hasFreshParam = window.location.search.indexOf( 'nopersist' ) !== -1;
	return isSupportSession && ! hasFreshParam;
};

use( plugins.persistence, persistOptions );

registerStore< State >( STORE_KEY, {
	actions,
	reducer,
	selectors,

	// Remove the persistence plugin for certain conditions - ie, during a support session
	...( shouldPersist()
		? {
				persist: [
					'domain',
					'siteTitle',
					'siteVertical',
					'pageLayouts',
					'selectedDesign',
					'shouldCreate',
				],
		  }
		: {} ),
} );

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
