/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/jetpack/init';

/**
 * Returns true if we are currently making a request to get the list of Jetpack
 * modules on the site. False otherwise.
 * Returns null if the status for queried site and module is unknown.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId The ID of the site we're querying
 * @returns {?boolean}         Whether the list is being requested
 */
export default function isFetchingJetpackModules( state, siteId ) {
	return get( state.jetpack.modules.requests, [ siteId, 'fetchingModules' ], null );
}
