import { get } from 'lodash';
import { requestJetpackSettings } from 'calypso/state/jetpack/settings/actions';
import getRequest from 'calypso/state/selectors/get-request';

/**
 * Returns true if we are currently making a request to fetch the Jetpack settings. False otherwise
 *
 * @param  {Object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @returns {boolean}             Whether Jetpack settings are currently being requested
 */
export default function isRequestingJetpackSettings( state, siteId ) {
	return get( getRequest( state, requestJetpackSettings( siteId ) ), 'isLoading', false );
}
