const isAkismetRedirect = ( redirectUrl: string | null ): boolean => {
	if ( ! redirectUrl ) {
		return false;
	}

	try {
		const url = new URL( redirectUrl );
		return (
			url.protocol === 'https:' &&
			( url.hostname === 'akismet.com' || url.hostname.endsWith( '.akismet.com' ) )
		);
	} catch ( e ) {
		return false;
	}
};

export default isAkismetRedirect;
