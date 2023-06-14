const getSubscribersCacheKey = (
	siteId: number | null,
	currentPage?: number,
	perPage?: number
) => {
	const cacheKey = [ 'subscribers', siteId ];
	if ( currentPage ) {
		cacheKey.push( currentPage );
	}
	if ( perPage ) {
		cacheKey.push( 'per-page', perPage );
	}
	return cacheKey;
};

const getEarnPageUrl = ( siteSlug: string | null ) =>
	`https://wordpress.com/earn/${ siteSlug ?? '' }`;

const sanitizeInt = ( intString: string ) => {
	const parsedInt = parseInt( intString, 10 );
	return ! Number.isNaN( parsedInt ) && parsedInt > 0 ? parsedInt : undefined;
};

export { getSubscribersCacheKey, getEarnPageUrl, sanitizeInt };
