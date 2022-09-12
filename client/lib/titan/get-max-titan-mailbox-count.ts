import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Returns the maximum number of mailboxes that can be provisioned for a domain. Because a Titan
 * subscription must have at least one mailbox, `1` is the default return value even for domains
 * without an active Titan subscription.
 */
export function getMaxTitanMailboxCount( domain: ResponseDomain ): number {
	return domain.titanMailSubscription?.maximumMailboxCount ?? 1;
}
