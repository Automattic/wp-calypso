import { type DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';

export const isSupportedPremiumDomain = ( availability: DomainAvailability ) => {
	return (
		availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM &&
		!! availability.is_supported_premium_domain
	);
};
