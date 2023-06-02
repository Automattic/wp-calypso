import { get } from 'lodash';
import { saveJetpackSettings } from 'calypso/state/jetpack/settings/actions';
import getRequest from 'calypso/state/selectors/get-request';

/**
 * Returns the status of the last Jetpack site settings save request
 *
 * @param  {Object}  state     Global state tree
 * @param  {number}  siteId    Site ID
 * @param  {Object}  settings  The settings we're updating
 * @returns {string}            The request status (pending, success or error)
 */
export default function getJetpackSettingsSaveRequestStatus( state, siteId, settings ) {
	return get( getRequest( state, saveJetpackSettings( siteId, settings ) ), 'status' );
}
