import type { EmailCost, ResponseDomain } from 'calypso/lib/domains/types';

export function getGoogleMailboxRenewalCost( domain: ResponseDomain ): EmailCost {
	return (
		domain.googleAppsSubscription?.renewalCostPerMailbox ?? { amount: 0, currency: '', text: '' }
	);
}
