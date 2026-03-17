const WPCOM_SUBDOMAIN_SUFFIXES = [ '.wordpress.com', '.wp.com' ];

/**
 * Detects whether a search query is for a WordPress.com subdomain
 * (e.g. "mysite.wordpress.com" or "mysite.wp.com").
 */
export function isWpcomSubdomainQuery( query: string ): boolean {
	return WPCOM_SUBDOMAIN_SUFFIXES.some( ( suffix ) => query.endsWith( suffix ) );
}

/**
 * Strips the WordPress.com subdomain suffix from a query, returning just the
 * subdomain label (e.g. "mysite.wordpress.com" → "mysite").
 */
export function stripWpcomSubdomainSuffix( query: string ): string {
	for ( const suffix of WPCOM_SUBDOMAIN_SUFFIXES ) {
		if ( query.endsWith( suffix ) ) {
			return query.slice( 0, -suffix.length );
		}
	}
	return query;
}
