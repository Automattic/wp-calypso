import { getTld } from './get-tld';
import { isFreeSubdomainQuery } from './is-free-subdomain-query';

/**
 * Detects whether a search query is a fully-qualified domain (an SLD plus a
 * TLD, e.g. "flowers.com") rather than a bare term ("flowers") or a free
 * subdomain ("mysite.wordpress.com").
 *
 * This is the gate that splits the two bundle surfaces: an FQDN query shows the
 * top BundleCard, while a bare-term query shows inline bundle rows (see
 * useInlineBundles). Keep the callers using this single helper so the two paths
 * can never disagree.
 */
export function isFqdnQuery( query: string ): boolean {
	return ! isFreeSubdomainQuery( query ) && !! getTld( query );
}
