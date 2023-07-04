const URL_PREFIX = 'https://wordpress.com';

const getEarnPageUrl = ( siteSlug: string | null ) => `${ URL_PREFIX }/earn/${ siteSlug ?? '' }`;

const getEarnPaymentsPageUrl = ( siteSlug: string | null ) =>
	`${ URL_PREFIX }/earn/payments/${ siteSlug ?? '' }`;

const getSubscribersCacheKey = (
	siteId: number | null,
	currentPage?: number,
	perPage?: number,
	search?: string,
	sortTerm?: string,
	filterOption?: string
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
	if ( filterOption ) {
		cacheKey.push( 'filter-option', filterOption );
	}
	return cacheKey;
};

const getSubscriberDetailsUrl = (
	siteSlug: string | undefined,
	subscriptionId: number | undefined,
	userId: number | undefined,
	pageNumber = 1
) => {
	if ( userId ) {
		return `/subscribers/${ siteSlug }/${ userId }?page=${ pageNumber }`;
	}

	return `/subscribers/external/${ siteSlug }/${ subscriptionId }?page=${ pageNumber }`;
};

const getSubscriberDetailsCacheKey = (
	siteId: number | null,
	subscriptionId: number | undefined,
	userId: number | undefined,
	type: string
) => [ 'subscriber-details', siteId, subscriptionId, userId, type ];

const sanitizeInt = ( intString: string ) => {
	const parsedInt = parseInt( intString, 10 );
	return ! Number.isNaN( parsedInt ) && parsedInt > 0 ? parsedInt : undefined;
};

const getSubscriberDetailsType = ( userId: number | undefined ) => ( userId ? 'wpcom' : 'email' );

export {
	getEarnPageUrl,
	getEarnPaymentsPageUrl,
	getSubscriberDetailsCacheKey,
	getSubscriberDetailsUrl,
	getSubscriberDetailsType,
	getSubscribersCacheKey,
	sanitizeInt,
};
