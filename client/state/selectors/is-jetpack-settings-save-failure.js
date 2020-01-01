/**
 * Internal dependencies
 */
import getJetpackSettingsSaveRequestStatus from 'state/selectors/get-jetpack-settings-save-request-status';

/**
 * Returns true if the save Jetpack site settings requests is successful
 *
 * @param  {object}  state     Global state tree
 * @param  {number}  siteId    Site ID
 * @param  {object}  settings  The settings we're updating
 * @return {boolean}           Whether the request is successful or not
 */
export default function isJetpackSettingsSaveFailure( state, siteId, settings ) {
	return getJetpackSettingsSaveRequestStatus( state, siteId, settings ) === 'failure';
}
