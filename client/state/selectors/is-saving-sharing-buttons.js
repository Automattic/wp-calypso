/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/sharing/init';

/**
 * Returns true if we are saving the sharing buttons for the specified site ID, false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether site's sharing buttons are being saved
 */
export default function isSavingSharingButtons( state, siteId ) {
	return get( state.sites.sharingButtons.saveRequests, [ siteId, 'saving' ], false );
}
