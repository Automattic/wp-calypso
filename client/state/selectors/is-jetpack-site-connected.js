/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getJetpackConnectionStatus from 'calypso/state/selectors/get-jetpack-connection-status';

/**
 * Returns true if we the Jetpack site is connected. False otherwise.
 * Returns null if the site is unknown, or there is no information yet.
 *
 * @param  {object}   state    Global state tree
 * @param  {number}   siteId   The ID of the site we're querying
 * @returns {?boolean}          Whether the site is connected.
 */
export default function isJetpackSiteConnected( state, siteId ) {
	return get( getJetpackConnectionStatus( state, siteId ), [ 'isActive' ], null );
}
