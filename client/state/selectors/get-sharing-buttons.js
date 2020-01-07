/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the sharing buttons for the specified site ID
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {object}        Sharing Buttons
 */
export default function getSharingButtons( state, siteId ) {
	return get( state.sites.sharingButtons.items, [ siteId ], null );
}
