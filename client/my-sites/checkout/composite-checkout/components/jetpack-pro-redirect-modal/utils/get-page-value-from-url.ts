const getPageValueFromUrl = ( url?: string ) => {
	if ( ! url ) {
		return '';
	}
	const newURL = new URL( url );
	const redirectURLParams = new URLSearchParams( newURL.search );
	return redirectURLParams.get( 'page' );
};

export default getPageValueFromUrl;
