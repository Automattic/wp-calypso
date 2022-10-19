import type { ResponseDomain } from 'calypso/lib/domains/types';

export function getConfiguredTitanMailboxCount( domain: ResponseDomain ): number {
	return domain.titanMailSubscription?.numberOfMailboxes ?? 0;
}
