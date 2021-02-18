/**
 * External dependencies
 */
import { get } from 'lodash';
import type { AppState } from 'calypso/types';

/**
 * Returns true if we are currently performing a request to fetch the site credentials.
 * False otherwise.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @returns {boolean}             Whether credentials are currently being requested for that site.
 */
export default function isRequestingSiteCredentials( state: AppState, siteId: number ): boolean {
	return get( state.jetpack.credentials.getRequestStatus, siteId, false ) === 'pending';
}
