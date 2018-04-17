/** @format */

/**
 * Internal dependencies
 */
import { getJetpackSettingsSaveRequestStatus } from 'state/selectors';

/**
 * Returns true if the save Jetpack site settings requests is successful
 *
 * @param  {Object}  state     Global state tree
 * @param  {Number}  siteId    Site ID
 * @param  {Object}  settings  The settings we're updating
 * @return {Boolean}           Whether the request is successful or not
 */
export default function isJetpackSettingsSaveFailure( state, siteId, settings ) {
	return getJetpackSettingsSaveRequestStatus( state, siteId, settings ) === 'failure';
}
