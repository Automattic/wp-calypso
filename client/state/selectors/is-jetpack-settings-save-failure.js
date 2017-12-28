/** @format */

/**
 * Internal dependencies
 */

import { getJetpackSettingsSaveRequestStatus } from 'client/state/selectors';

/**
 * Returns true if the save Jetpack site settings requests is successful
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}         Whether the requests is successful or not
 */
export default function isJetpackSettingsSaveFailure( state, siteId ) {
	return getJetpackSettingsSaveRequestStatus( state, siteId ) === 'error';
}
