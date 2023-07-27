const removeStatsPurchaseSuccessParam = ( url: string ) => {
	// For Odyssey Stats, we simply update the hash which is equavalent to updating the URL.
	const currentUrl = new URL( url );

	// Delete param in GET params.
	currentUrl.searchParams.delete( 'statsPurchaseSuccess' );

	const hashUrl = new URL( currentUrl.hash.substring( 2 ), window.location.origin );
	// Delete param in hash URL.
	hashUrl.searchParams.delete( 'statsPurchaseSuccess' );
	if ( hashUrl.search ) {
		currentUrl.hash = `#!${ hashUrl.pathname }${ hashUrl.search }`;
	}

	return currentUrl.toString();
};

export { removeStatsPurchaseSuccessParam as default };
