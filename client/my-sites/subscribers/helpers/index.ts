const URL_PREFIX = 'https://wordpress.com';

const getEarnPageUrl = ( siteSlug: string | null ) => `${ URL_PREFIX }/earn/${ siteSlug ?? '' }`;

const getEarnPaymentsPageUrl = ( siteSlug: string | null ) =>
	`${ URL_PREFIX }/earn/payments/${ siteSlug ?? '' }`;

const getSubscribersCacheKey = (
	siteId: number | null,
	currentPage?: number,
	perPage?: number,
	search?: string,
	sortTerm?: string
) => {
	const cacheKey = [ 'subscribers', siteId ];
	if ( currentPage ) {
		cacheKey.push( currentPage );
	}
	if ( perPage ) {
		cacheKey.push( 'per-page', perPage );
	}
	if ( search ) {
		cacheKey.push( 'search', search );
	}
	if ( sortTerm ) {
		cacheKey.push( 'sort-term', sortTerm );
	}
	return cacheKey;
};

const getSubscriberDetailsCacheKey = ( siteId: number | null, queryString: string ) => [
	'subscriber-details',
	siteId,
	queryString,
];

const sanitizeInt = ( intString: string ) => {
	const parsedInt = parseInt( intString, 10 );
	return ! Number.isNaN( parsedInt ) && parsedInt > 0 ? parsedInt : undefined;
};

export {
	getEarnPageUrl,
	getEarnPaymentsPageUrl,
	getSubscriberDetailsCacheKey,
	getSubscribersCacheKey,
	sanitizeInt,
};
