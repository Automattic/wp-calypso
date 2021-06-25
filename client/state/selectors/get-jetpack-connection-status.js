/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/jetpack/init';

/**
 * Returns the current status of the connection.
 * Returns null if the site is unknown, or status hasn't been received yet.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @returns {?object}             Details about connection status
 */
export default function getJetpackConnectionStatus( state, siteId ) {
	return get( state.jetpack.connection.items, [ siteId ], null );
}
