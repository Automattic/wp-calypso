import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Gets Google Workspace subscription status for a given domain object.
 * @returns {string} - Subscription status or empty string for null/undefined values
 */
export function getGSuiteSubscriptionStatus( domain: ResponseDomain | undefined ): string {
	return domain?.googleAppsSubscription?.status ?? '';
}
