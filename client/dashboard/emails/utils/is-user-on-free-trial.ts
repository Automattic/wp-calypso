import { EmailSubscription } from '@automattic/api-core';

export function isUserOnFreeTrial( emailSubscription?: EmailSubscription ): boolean {
	return emailSubscription?.purchase_cost_per_mailbox?.amount === 0;
}
