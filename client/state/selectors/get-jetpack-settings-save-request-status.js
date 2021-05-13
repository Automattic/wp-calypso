/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRequest from 'calypso/state/selectors/get-request';
import { saveJetpackSettings } from 'calypso/state/jetpack/settings/actions';

/**
 * Returns the status of the last Jetpack site settings save request
 *
 * @param  {object}  state     Global state tree
 * @param  {number}  siteId    Site ID
 * @param  {object}  settings  The settings we're updating
 * @returns {string}            The request status (pending, success or error)
 */
export default function getJetpackSettingsSaveRequestStatus( state, siteId, settings ) {
	return get( getRequest( state, saveJetpackSettings( siteId, settings ) ), 'status' );
}
