import type { EmailCost, ResponseDomain } from 'calypso/lib/domains/types';
import type { SiteDomain } from 'calypso/state/sites/domains/types';

export function getGoogleMailboxRenewalCost(
	domain: ResponseDomain | SiteDomain | undefined
): EmailCost | null {
	return domain?.googleAppsSubscription?.renewalCostPerMailbox ?? null;
}
