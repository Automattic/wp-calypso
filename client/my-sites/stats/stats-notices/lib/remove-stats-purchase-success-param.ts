const getUrlwithStatsPurchaseSuccessParamRemoved = ( url: string, isOdysseyStats: boolean ) => {
	// Delete param in GET params.
	const currentUrl = new URL( url );
	currentUrl.searchParams.delete( 'statsPurchaseSuccess' );

	// Delete param in hash URL for Odyssey Stats if any.
	if ( isOdysseyStats && currentUrl.hash.startsWith( '#!' ) ) {
		const hashUrl = new URL( currentUrl.hash.substring( 2 ), currentUrl.origin );
		hashUrl.searchParams.delete( 'statsPurchaseSuccess' );
		currentUrl.hash = `#!${ hashUrl.pathname }${ hashUrl.search }`;
	}
	return currentUrl;
};

export { getUrlwithStatsPurchaseSuccessParamRemoved as default };
