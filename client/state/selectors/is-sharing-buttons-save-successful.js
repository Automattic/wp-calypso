/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/sharing/init';

/**
 * Returns true if the save sharing buttons requests is successful
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether the request is successful or not
 */
export default function isSharingButtonsSaveSuccessful( state, siteId ) {
	return get( state.sites.sharingButtons.saveRequests, [ siteId, 'status' ] ) === 'success';
}
