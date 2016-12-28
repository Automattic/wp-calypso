/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are saving the sharing buttons for the specified site ID, false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether site's sharing buttons are being saved
 */
export default function isSavingSharingButtons( state, siteId ) {
	return get( state.sites.sharingButtons.saveRequests, [ siteId, 'saving' ], false );
}
