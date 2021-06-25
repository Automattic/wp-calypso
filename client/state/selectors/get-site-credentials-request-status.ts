/**
 * External dependencies
 */
import type { AppState } from 'calypso/types';

/**
 * Returns the status of the request to fetch a site credentials
 *
 * @param  {AppState} state Global state tree
 * @param  {number} siteId The ID of the site we're querying
 * @returns {string} Request status
 */
export default function getSiteCredentialsRequestStatus(
	state: AppState,
	siteId: number
): string | undefined {
	return state.jetpack?.credentials?.getRequestStatus?.[ siteId ];
}
