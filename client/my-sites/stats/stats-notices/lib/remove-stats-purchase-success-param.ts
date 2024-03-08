import page from '@automattic/calypso-router';

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

const removeStatsPurchaseSuccessParamFromCurrentUrl = ( isOdysseyStats: boolean ) => {
	const newUrlObj = getUrlwithStatsPurchaseSuccessParamRemoved(
		window.location.href,
		isOdysseyStats
	);
	// Odyssey would try to hack the URL on load to remove duplicate params. We need to wait for that to finish.
	setTimeout( () => {
		window.history.replaceState( null, '', newUrlObj.toString() );
		if ( isOdysseyStats ) {
			// We need to update the page base if it changed. Otherwise, pagejs won't be able to find the routes.
			page.base( `${ newUrlObj.pathname }${ newUrlObj.search }` );
		}
	}, 300 );
};

export {
	getUrlwithStatsPurchaseSuccessParamRemoved as default,
	removeStatsPurchaseSuccessParamFromCurrentUrl,
};
