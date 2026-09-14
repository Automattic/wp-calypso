const WPCOM_SUBDOMAIN_SUFFIX = '.wordpress.com';

/**
 * List of free .blog subdomains offered by WordPress.com.
 * Duplicated from packages/domains-table/src/utils/is-free-url-domain-name.ts
 * to avoid a heavy dependency. Keep both lists in sync when adding new subdomains.
 */
const FREE_DOT_BLOG_SUBDOMAINS = [
	'art',
	'business',
	'car',
	'code',
	'data',
	'design',
	'family',
	'fashion',
	'finance',
	'fitness',
	'food',
	'game',
	'health',
	'home',
	'law',
	'movie',
	'music',
	'news',
	'p2',
	'photo',
	'poetry',
	'politics',
	'school',
	'science',
	'sport',
	'tech',
	'travel',
	'video',
	'water',
];

const BLOG_SUBDOMAIN_SUFFIXES = FREE_DOT_BLOG_SUBDOMAINS.map(
	( subdomain ) => `.${ subdomain }.blog`
);

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

/**
 * Detects whether a search query is for a free .blog subdomain
 * (e.g. "test.tech.blog", "mysite.photo.blog").
 */
export function isBlogSubdomainQuery( query: string ): boolean {
	return BLOG_SUBDOMAIN_SUFFIXES.some( ( suffix ) => query.endsWith( suffix ) );
}

/**
 * Detects whether a search query is for any free subdomain
 * (.wordpress.com or free .blog subdomains).
 */
export function isFreeSubdomainQuery( query: string ): boolean {
	return isWpcomSubdomainQuery( query ) || isBlogSubdomainQuery( query );
}
