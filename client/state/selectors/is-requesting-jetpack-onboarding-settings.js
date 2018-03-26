/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getRequest } from 'state/selectors';
import { requestJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';

/**
 * Returns true if we are currently making a request to fetch the Jetpack settings. False otherwise
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @param  {Object}  query       An optional query to be passed to the JP settings endpoint
 * @return {Boolean}             Whether Jetpack settings are currently being requested
 */
export default function isRequestingJetpackOnboardingSettings( state, siteId, query ) {
	return get(
		getRequest( state, requestJetpackOnboardingSettings( siteId, query ) ),
		'isLoading',
		false
	);
}
