import type { ResponseDomain } from 'calypso/lib/domains/types';

export function getConfiguredTitanMailboxCount( domain: ResponseDomain | undefined ): number {
	return domain?.titanMailSubscription?.numberOfMailboxes ?? 0;
}
