const removeStatsPurchaseSuccessParam = ( url: string ) => {
	// Delete param in GET params.
	const currentUrl = new URL( url );
	currentUrl.searchParams.delete( 'statsPurchaseSuccess' );

	// Delete param in hash URL.
	const hashUrl = new URL( currentUrl.hash.substring( 2 ), window.location.origin );
	hashUrl.searchParams.delete( 'statsPurchaseSuccess' );
	if ( hashUrl.search ) {
		currentUrl.hash = `#!${ hashUrl.pathname }${ hashUrl.search }`;
	}

	return currentUrl.toString();
};

export { removeStatsPurchaseSuccessParam as default };
