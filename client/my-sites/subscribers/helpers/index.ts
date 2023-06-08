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

export { getSubscribersCacheKey };
