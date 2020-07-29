/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getJetpackUserConnection from 'state/selectors/get-jetpack-user-connection';

/**
 * Returns true if the Jetpack site current user is the user who owns the connection. False otherwise.
 * Returns null if the site is unknown, or there is no information yet.
 *
 * @param  {object}   state    Global state tree
 * @param  {number}   siteId   The ID of the site we're querying
 * @returns {?boolean}          Whether the current site user is the connection owner.
 */
export default function isJetpackUserConnectionOwner( state, siteId ) {
	// eslint-disable-next-line inclusive-language/use-inclusive-words
	return get( getJetpackUserConnection( state, siteId ), [ 'isMaster' ], null );
}
