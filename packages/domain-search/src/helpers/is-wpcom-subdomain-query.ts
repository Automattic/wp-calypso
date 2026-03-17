const WPCOM_SUBDOMAIN_SUFFIX = '.wordpress.com';

/**
 * Detects whether a search query is for a WordPress.com subdomain
 * (e.g. "mysite.wordpress.com").
 */
export function isWpcomSubdomainQuery( query: string ): boolean {
	return query.endsWith( WPCOM_SUBDOMAIN_SUFFIX );
}

/**
 * Strips the WordPress.com subdomain suffix from a query, returning just the
 * subdomain label (e.g. "mysite.wordpress.com" → "mysite").
 */
export function stripWpcomSubdomainSuffix( query: string ): string {
	if ( query.endsWith( WPCOM_SUBDOMAIN_SUFFIX ) ) {
		return query.slice( 0, -WPCOM_SUBDOMAIN_SUFFIX.length );
	}
	return query;
}
