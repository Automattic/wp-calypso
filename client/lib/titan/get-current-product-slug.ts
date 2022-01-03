import type { ResponseDomain } from 'calypso/lib/domains/types';

export function getCurrentProductSlug( domain: ResponseDomain ): string | null {
	return domain?.titanMailSubscription?.productSlug ?? null;
}
