import { purchaseQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { getEmailSubscriptionIdByDomain } from 'calypso/my-sites/email/email-management/home/utils';
import type { Purchase } from '@automattic/api-core';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Fetches the email purchase associated with the specified domain.
 */
export function useEmailPurchaseByDomain( domain: ResponseDomain ): {
	purchase: Purchase | undefined;
	isLoadingPurchase: boolean;
} {
	const subscriptionId = getEmailSubscriptionIdByDomain( domain );

	const { data: purchase, isPending } = useQuery( {
		...purchaseQuery( subscriptionId as number ),
		enabled: Boolean( subscriptionId ),
	} );

	// A disabled query stays `pending` forever, so a domain without an email
	// subscription must not read as perpetually loading.
	return { purchase, isLoadingPurchase: Boolean( subscriptionId ) && isPending };
}
