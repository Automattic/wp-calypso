import { DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { isSubdomain } from './is-subdomain';

/**
 * Detects a subdomain (e.g. cms.example.com) that can't be connected because its
 * root domain (example.com) is already registered or mapped on WordPress.com by a
 * different account. The subdomain itself is unclaimed, but only the account that
 * owns the root domain connection can add it, so a "transfer domain" CTA is not an
 * appropriate resolution here.
 *
 * For a subdomain query the backend computes `status` against the ROOT domain:
 * REGISTERED reliably means another user registered the root, and MAPPED means the
 * root is mapped elsewhere. The `mappable` field is intentionally not used here: it
 * describes the subdomain itself and is set whenever the subdomain has any mapping
 * record (including the current user's own), so it yields false positives on a
 * user's own domains. The one residual ambiguity is that when the root is not on
 * WordPress.com at all, the backend copies the subdomain's own mapped state into
 * `status`, so MAPPED can occasionally reflect the current user's own subdomain
 * mapping; there is no response field that distinguishes that case.
 */
export function isSubdomainWithMappedRootDomain( availability: DomainAvailability ): boolean {
	if ( ! isSubdomain( availability.domain_name ) ) {
		return false;
	}

	return (
		availability.status === DomainAvailabilityStatus.MAPPED ||
		availability.status === DomainAvailabilityStatus.REGISTERED
	);
}
