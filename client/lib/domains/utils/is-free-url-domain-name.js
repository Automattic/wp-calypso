export function isFreeUrlDomainName( domainName ) {
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
	freeUrlDomainNames.unshift( '.wordpress.com', '.wpcomstaging.com' );

	return freeUrlDomainNames.some( ( freeUrlDomainName ) =>
		domainName.endsWith( freeUrlDomainName )
	);
}
