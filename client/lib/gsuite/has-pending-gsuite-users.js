/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Determines whether the specified G Suite account have at least one pending G Suite user. A pending user refers to a
 * user who has not agreed to Google ToS yet.
 *
 * @param {object} domain - domain identifying a G Suite account
 * @returns {boolean} - true if that account have pending G Suite users, false otherwise
 */
export function hasPendingGSuiteUsers( domain ) {
	return get( domain, 'googleAppsSubscription.pendingUsers.length', 0 ) !== 0;
}
