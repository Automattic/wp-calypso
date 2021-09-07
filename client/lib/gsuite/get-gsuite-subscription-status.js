/**
 * Gets Google Workspace subscription status for a given domain object.
 *
 * @param {object} domain - Domain object
 * @returns {string} - Subscription status or empty string for null/undefined values
 */
export function getGSuiteSubscriptionStatus( domain ) {
	return domain?.googleAppsSubscription?.status ?? '';
}
