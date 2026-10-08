import { DomainAvailability } from '@automattic/api-core';
import { isSubdomain } from './is-subdomain';

/**
 * Detects a subdomain (e.g. cms.example.com) whose root domain (example.com) is
 * registered or mapped on WordPress.com by a different account. Only that account can
 * add the subdomain, so a "transfer domain" CTA is not an appropriate resolution here.
 *
 * This relies on the backend `root_domain_owned_by_other_user` flag. The availability
 * response cannot otherwise tell this apart from the user's own already-mapped
 * subdomain of an externally-registered root (both come back as the subdomain with
 * `status: mapped_domain`), so the ownership decision has to come from the backend,
 * which resolves it from the root's owner.
 */
export function isSubdomainWithUnavailableRootDomain(
	availability: DomainAvailability,
	searchedDomainName: string
): boolean {
	return isSubdomain( searchedDomainName ) && availability.root_domain_owned_by_other_user === true;
}
