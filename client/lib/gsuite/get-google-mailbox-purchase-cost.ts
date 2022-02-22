import type { EmailCost, ResponseDomain } from 'calypso/lib/domains/types';

export function getGoogleMailboxPurchaseCost( domain: ResponseDomain ): EmailCost {
	return (
		domain.googleAppsSubscription?.purchaseCostPerMailbox ?? { amount: 0, currency: '', text: '' }
	);
}
