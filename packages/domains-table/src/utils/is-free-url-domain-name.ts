/**
 * Checks wheter a domain is a managed WPCOM subdomain such as fine.art.blog, cool.tech.blog or
 * mylinkinbio.w.link.
 *
 * We need to update this function every time a new free managed subdomain is added to WPCOM.
 */
export function isFreeUrlDomainName( domainName: string ): boolean {
	const freeDotBlogSubdomains = [
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

	const freeUrlDomainNames = freeDotBlogSubdomains.map(
		( dotBlogSubdomain ) => `.${ dotBlogSubdomain }.blog`
	);
	freeUrlDomainNames.unshift( '.w.link', '.wordpress.com', '.wpcomstaging.com' );

	return freeUrlDomainNames.some( ( freeUrlDomainName ) =>
		domainName.endsWith( freeUrlDomainName )
	);
}
