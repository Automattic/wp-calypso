export function redirect( to: string ) {
	window.location.href = to;
}

// Update query params without refresh/rerender
export function updateQueryParams( queryParams: string ) {
	const path = `${ window.location.pathname }?${ queryParams }`;
	window.history.pushState( { path }, '', path );
}

export function removeTrailingSlash( str: string ) {
	return str.replace( /\/+$/, '' );
}

export function removeLeadingSlash( str: string ) {
	return str.replace( /^\/+/, '' );
}

export function getSiteIdParam( urlQueryParams: URLSearchParams ): number | undefined {
	const siteId = urlQueryParams.get( 'siteId' );
	const parsedId = parseInt( siteId ?? '', 10 );
	return isNaN( parsedId ) ? undefined : parsedId;
}
