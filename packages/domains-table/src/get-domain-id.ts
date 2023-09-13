import type { DomainData, PartialDomainData } from '@automattic/data-stores';

/**
 * Returns a synthetic ID for a domain.
 *
 * Using the domain name isn't unique enough: redirect domains uses the redirect
 * destination as their `domain` field, meaning if the user owns the redirect
 * destination too, then both can appear in the domains table at the same time.
 */
export function getDomainId( domain: PartialDomainData | DomainData ): string {
	return domain.domain + domain.blog_id;
}
