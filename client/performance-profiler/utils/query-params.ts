import page from '@automattic/calypso-router';

export const updateQueryParams = ( params: Record< string, string >, forceReload = false ) => {
	const queryParams = new URLSearchParams( window.location.search );
	Object.keys( params ).forEach( ( key ) => {
		if ( params[ key ] ) {
			queryParams.set( key, params[ key ] );
		}
	} );

	// If forceReload is true, we want to reload the page with the new query params instead of just updating the URL
	if ( forceReload ) {
		page( `/speed-test-tool?${ queryParams.toString() }` );
	} else {
		window.history.replaceState( {}, '', `?${ queryParams.toString() }` );
	}
};
