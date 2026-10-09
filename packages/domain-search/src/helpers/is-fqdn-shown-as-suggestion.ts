import { type DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { isSupportedPremiumDomain } from './is-supported-premium-domain';

/**
 * Whether the availability result of an FQDN query is rendered as the exact-match card.
 */
export const isFqdnShownAsSuggestion = (
	fqdnAvailability: DomainAvailability,
	includeOwnedDomainInSuggestions: boolean
) => {
	if (
		fqdnAvailability.status === DomainAvailabilityStatus.AVAILABLE ||
		( includeOwnedDomainInSuggestions &&
			fqdnAvailability.status === DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER )
	) {
		return true;
	}

	return isSupportedPremiumDomain( fqdnAvailability );
};
