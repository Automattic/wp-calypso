/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getRequest } from 'state/selectors';
import { saveJetpackSettings } from 'state/jetpack/settings/actions';

/**
 * Returns the status of the last Jetpack site settings save request
 *
 * @param  {Object}  state     Global state tree
 * @param  {Number}  siteId    Site ID
 * @param  {Object}  settings  The settings we're updating
 * @return {String}            The request status (pending, success or error)
 */
export default function getJetpackSettingsSaveRequestStatus( state, siteId, settings ) {
	return get( getRequest( state, saveJetpackSettings( siteId, settings ) ), 'status' );
}
