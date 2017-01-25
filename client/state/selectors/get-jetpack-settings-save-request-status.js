/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the status of the last Jetpack site settings save request
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {String}         The request status (peding, success or error)
 */
export default function getJetpackSettingsSaveRequestStatus( state, siteId ) {
	return get( state.jetpack.settings.saveRequests, [ siteId, 'status' ] );
}
