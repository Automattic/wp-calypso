import type { ResponseDomain as Domain, EmailCost } from 'calypso/lib/domains/types';

export function isUserOnTitanFreeTrial( domainOrEmailCost: Domain | EmailCost ): boolean {
	let amountOfMailboxPurchaseCost: number | undefined;

	if ( 'amount' in domainOrEmailCost ) {
		amountOfMailboxPurchaseCost = domainOrEmailCost.amount;
	} else {
		amountOfMailboxPurchaseCost =
			domainOrEmailCost.titanMailSubscription?.purchaseCostPerMailbox?.amount;
	}

	return amountOfMailboxPurchaseCost === 0;
}
