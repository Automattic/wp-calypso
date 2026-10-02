import { DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { isSubdomain } from './is-subdomain';

const SAME_ACCOUNT_MAPPED_STATUSES = [
	DomainAvailabilityStatus.REGISTERED_SAME_SITE,
	DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER,
	DomainAvailabilityStatus.MAPPED_OTHER_SITE_SAME_USER_REGISTRABLE,
	DomainAvailabilityStatus.MAPPED_SAME_SITE_REGISTRABLE,
];

/**
 * Detects a subdomain (e.g. cms.example.com) that can't be connected because its
 * root domain (example.com) connection is owned by a different WordPress.com
 * account. The subdomain itself is unclaimed, but only the account that owns the
 * root domain connection can add it, so a "transfer domain" CTA is not an
 * appropriate resolution here.
 */
export function isSubdomainWithMappedRootDomain( availability: DomainAvailability ): boolean {
	if ( ! isSubdomain( availability.domain_name ) ) {
		return false;
	}

	if ( SAME_ACCOUNT_MAPPED_STATUSES.includes( availability.status ) ) {
		return false;
	}

	return (
		availability.status === DomainAvailabilityStatus.MAPPED ||
		availability.mappable === DomainAvailabilityStatus.MAPPED
	);
}
