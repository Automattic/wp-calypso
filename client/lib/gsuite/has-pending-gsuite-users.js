/**
 * Does a domain have pending G Suite Users
 *
 * @param {object} domain - domain object
 * @returns {boolean} - Does domain have pending G Suite users
 */
export function hasPendingGSuiteUsers( domain ) {
	return 0 !== ( domain?.googleAppsSubscription?.pendingUsers?.length ?? 0 );
}
