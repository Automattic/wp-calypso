import type { ResponseDomain } from 'calypso/lib/domains/types';

export function isDomainEligibleForTitanIntroductoryOffer( domain?: ResponseDomain ): boolean {
	return domain?.titanMailSubscription?.isEligibleForIntroductoryOffer ?? false;
}
