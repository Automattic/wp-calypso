/**
 * Gets Google Workspace subscription status for a given domain object,
 * If resulting status is null or undefined, it returns empty string.
 *
 * @param {object} domain - Domain object
 * @returns {string} - Subscription status or empty string for null/undefined values
 */
export function getGSuiteSubscriptionStatus( domain ) {
	return domain?.googleAppsSubscription?.status ?? '';
}
