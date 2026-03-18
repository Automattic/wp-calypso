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
 * Detects whether a search query is for a free .blog subdomain
 * (e.g. "test.tech.blog", "mysite.photo.blog").
 */
export function isBlogSubdomainQuery( query: string ): boolean {
	return BLOG_SUBDOMAIN_SUFFIXES.some( ( suffix ) => query.endsWith( suffix ) );
}
