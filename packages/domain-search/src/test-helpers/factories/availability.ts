import { DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';

export const buildAvailability = (
	availability: Partial< DomainAvailability > = {}
): DomainAvailability => {
	return {
		domain_name: availability.domain_name ?? 'example.com',
		tld: availability.tld ?? 'com',
		status: availability.status ?? DomainAvailabilityStatus.AVAILABLE,
		mappable: availability.mappable ?? 'mappable',
		supports_privacy: availability.supports_privacy ?? true,
		root_domain_provider: availability.root_domain_provider ?? 'wpcom',
		cost: availability.cost ?? 'Free',
		currency_code: availability.currency_code ?? 'USD',
		...availability,
	};
};
