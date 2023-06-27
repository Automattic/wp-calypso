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

const getSubscriberDetailsUrl = (
	siteSlug: string | null,
	subscription_id: number | undefined,
	user_id: number | undefined
) => {
	if ( user_id ) {
		return `/subscribers/${ siteSlug }/${ user_id }`;
	}

	return `/subscribers/external/${ siteSlug }/${ subscription_id }`;
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
