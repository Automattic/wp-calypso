import { get } from 'lodash';
import { saveJetpackSettings } from 'calypso/state/jetpack/settings/actions';
import getRequest from 'calypso/state/selectors/get-request';

/**
 * Returns true if we are currently making a request to update the Jetpack settings. False otherwise
 *
 * @param  {Object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @param  {Object}  settings    The settings we're updating
 * @returns {boolean}             Whether Jetpack settings are currently being updated
 */
export default function isUpdatingJetpackSettings( state, siteId, settings ) {
	return get( getRequest( state, saveJetpackSettings( siteId, settings ) ), 'isLoading', false );
}
