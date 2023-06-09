const getSubscribersCacheKey = ( siteId: number | null, currentPage?: number ) => {
	const cacheKey = [ 'subscribers', siteId ];
	if ( currentPage ) {
		cacheKey.push( currentPage );
	}
	return cacheKey;
};

export { getSubscribersCacheKey };
