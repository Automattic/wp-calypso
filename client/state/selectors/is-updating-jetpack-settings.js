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
 * Returns true if we are currently making a request to update the Jetpack settings. False otherwise
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @param  {Object}  settings    The settings we're updating
 * @return {Boolean}             Whether Jetpack settings are currently being updated
 */
export default function isUpdatingJetpackSettings( state, siteId, settings ) {
	return get( getRequest( state, saveJetpackSettings( siteId, settings ) ), 'isLoading', false );
}
