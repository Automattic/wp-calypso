/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRequest from 'calypso/state/selectors/get-request';
import { requestJetpackSettings } from 'calypso/state/jetpack/settings/actions';

/**
 * Returns true if we are currently making a request to fetch the Jetpack settings. False otherwise
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @param  {object}  query       An optional query to be passed to the JP settings endpoint
 * @returns {boolean}             Whether Jetpack settings are currently being requested
 */
export default function isRequestingJetpackSettings( state, siteId, query ) {
	return get( getRequest( state, requestJetpackSettings( siteId, query ) ), 'isLoading', false );
}
