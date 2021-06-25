/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getJetpackUserConnection from 'calypso/state/selectors/get-jetpack-user-connection';

/**
 * Returns the display name of the Jetpack connection's owner.
 *
 * @param  {object}   state    Global state tree
 * @param  {number}   siteId   The ID of the site we're querying
 * @returns {?string}          The name of the Jetpack connection's owner
 */
export default function getJetpackConnectionOwner( state, siteId ) {
	return get( getJetpackUserConnection( state, siteId ), [ 'connectionOwner' ], null );
}
