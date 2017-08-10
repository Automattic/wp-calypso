/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the connection data of the current user.
 * Returns null if the site is unknown, or data hasn't been received yet.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {?Object}             User connection data
 */
export default function getJetpackUserConnection( state, siteId ) {
	return get( state.jetpack.connection.dataItems, [ siteId ], null );
}
