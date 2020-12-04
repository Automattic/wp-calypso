/**
 * External dependencies
 */

import { some } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteUserConnections } from 'calypso/state/sharing/publicize/selectors';

/**
 * Returns true if a broken Publicize connections exists for the specified site
 * and user, or false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  userId User ID
 * @returns {boolean}        Whether broken connection exists
 */
export default function hasBrokenSiteUserConnection( state, siteId, userId ) {
	return some( getSiteUserConnections( state, siteId, userId ), { status: 'broken' } );
}
