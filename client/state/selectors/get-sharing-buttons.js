/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the sharing buttons for the specified site ID
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Object}        Sharing Buttons
 */
export default function getSharingButtons( state, siteId ) {
	return get( state.sites.sharingButtons.items, [ siteId ], null );
}
