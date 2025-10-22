import { Domain } from '@automattic/api-core';

export function isUserOnTitanFreeTrial( domain: Domain ): boolean {
	return domain.titan_mail_subscription?.purchase_cost_per_mailbox?.amount === 0;
}
