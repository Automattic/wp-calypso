import { DomainAvailability, DomainAvailabilityStatus } from '@automattic/api-core';
import { isSubdomain } from './is-subdomain';

/**
 * Detects a subdomain (e.g. cms.example.com) that can't be connected because its
 * root domain (example.com) is already registered or mapped on WordPress.com by a
 * different account. The subdomain itself is unclaimed, but only the account that
 * owns the root domain can add it, so a "transfer domain" CTA is not an appropriate
 * resolution here.
 *
 * `searchedDomainName` is the name the user actually queried. Detection then relies
 * on two things from the availability response:
 *
 * 1. The backend reports on the ROOT. For a subdomain query it swaps the response
 *    `domain_name` to the root only when the root itself has a WordPress.com
 *    registration or mapping; otherwise it leaves `domain_name` as the searched
 *    subdomain and `status` describes the subdomain itself. We detect the former by
 *    `domain_name !== searchedDomainName` (the backend returned the root rather than
 *    echoing the query), which excludes the user's own already-mapped subdomain of
 *    an externally-registered root. Comparing to the returned `domain_name` directly
 *    avoids re-deriving the root from the query, which `getRootDomain` only
 *    approximates for multi-level public suffixes.
 * 2. REGISTERED means another user registered the root; MAPPED means the root is
 *    mapped elsewhere. The `mappable` field is intentionally not used: it describes
 *    the subdomain itself and is set for the user's own mappings too, so it yields
 *    false positives.
 */
export function isSubdomainWithUnavailableRootDomain(
	availability: DomainAvailability,
	searchedDomainName: string
): boolean {
	if ( ! isSubdomain( searchedDomainName ) ) {
		return false;
	}

	if ( availability.domain_name === searchedDomainName ) {
		return false;
	}

	return (
		availability.status === DomainAvailabilityStatus.MAPPED ||
		availability.status === DomainAvailabilityStatus.REGISTERED
	);
}
