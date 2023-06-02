import type { EmailCost, ResponseDomain } from 'calypso/lib/domains/types';

export function getGSuiteMailboxPurchaseCost(
	domain: ResponseDomain | undefined
): EmailCost | null {
	return domain?.googleAppsSubscription?.purchaseCostPerMailbox ?? null;
}
