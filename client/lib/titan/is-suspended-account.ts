import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { SiteDomain } from 'calypso/state/sites/domains/types';

export function isSuspendedAccount( domain: ResponseDomain | SiteDomain | undefined ): boolean {
	const subscriptionStatus = domain?.titanMailSubscription?.status ?? '';

	return subscriptionStatus === 'suspended';
}
