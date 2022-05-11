import type { ResponseDomain } from 'calypso/lib/domains/types';

export function hasTitanMailWithUs( domain: ResponseDomain | undefined ): boolean {
	const subscriptionStatus = domain?.titanMailSubscription?.status ?? '';

	return subscriptionStatus === 'active' || subscriptionStatus === 'suspended';
}
