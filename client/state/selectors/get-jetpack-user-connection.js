/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/jetpack/init';

/**
 * Returns the connection data of the current user.
 * Returns null if the site is unknown, or data hasn't been received yet.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @returns {?object}             User connection data
 */
export default function getJetpackUserConnection( state, siteId ) {
	return get( state.jetpack.connection.dataItems, [ siteId ], null );
}
