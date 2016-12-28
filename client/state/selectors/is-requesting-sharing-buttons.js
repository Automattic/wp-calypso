/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are requesting the sharing buttons for the specified site ID, false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether site's sharing buttons are being requested
 */
export default function isRequestingSharingButtons( state, siteId ) {
	return get( state.sites.sharingButtons.requesting, [ siteId ], false );
}
