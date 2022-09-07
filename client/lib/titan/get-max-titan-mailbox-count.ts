import type { ResponseDomain } from 'calypso/lib/domains/types';

export function getMaxTitanMailboxCount( domain: ResponseDomain | undefined ): number {
	return domain?.titanMailSubscription?.maximumMailboxCount ?? 1;
}
