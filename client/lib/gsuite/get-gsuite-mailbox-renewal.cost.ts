import type { EmailCost, ResponseDomain } from 'calypso/lib/domains/types';

export function getGSuiteMailboxRenewalCost(
	domain: ResponseDomain | undefined
): EmailCost | null {
	return domain?.googleAppsSubscription?.renewalCostPerMailbox ?? null;
}
