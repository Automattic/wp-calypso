export const persistQueryParams = ( url: string, urlQueryParams: URLSearchParams ) => {
	if ( ! urlQueryParams.toString() ) {
		return url;
	}

	const separator = url.includes( '?' ) ? '&' : '?';
	return `${ url }${ separator }${ urlQueryParams.toString() }`;
};
