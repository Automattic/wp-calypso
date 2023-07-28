const removeStatsPurchaseSuccessParam = ( url: string ) => {
	// Delete param in GET params.
	const currentUrl = new URL( url );
	currentUrl.searchParams.delete( 'statsPurchaseSuccess' );

	// Delete param in hash URL if any.
	if ( currentUrl.hash ) {
		const hashUrl = new URL( currentUrl.hash.substring( 2 ), currentUrl.origin );
		hashUrl.searchParams.delete( 'statsPurchaseSuccess' );
		currentUrl.hash = `#!${ hashUrl.pathname }${ hashUrl.search }`;
	}
	return currentUrl.toString();
};

export { removeStatsPurchaseSuccessParam as default };
