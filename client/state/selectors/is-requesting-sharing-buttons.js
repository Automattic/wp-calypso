/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/sharing/init';

/**
 * Returns true if we are requesting the sharing buttons for the specified site ID, false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether site's sharing buttons are being requested
 */
export default function isRequestingSharingButtons( state, siteId ) {
	return get( state.sites.sharingButtons.requesting, [ siteId ], false );
}
