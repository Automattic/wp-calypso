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
 * Returns true if we are currently making a request to update the Jetpack settings. False otherwise
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @param  {object}  settings    The settings we're updating
 * @returns {boolean}             Whether Jetpack settings are currently being updated
 */
export default function isUpdatingJetpackSettings( state, siteId, settings ) {
	return get( getRequest( state, saveJetpackSettings( siteId, settings ) ), 'isLoading', false );
}
