const isPassportRedirect = ( redirectUrl: string | null ): boolean => {
	if ( ! redirectUrl ) {
		return false;
	}

	try {
		const url = new URL( redirectUrl );
		return (
			url.protocol === 'https:' &&
			( url.hostname === 'passportproduction.wordpress.com' ||
				url.hostname.endsWith( '.passportproduction.wordpress.com' ) ||
				url.hostname === 'passport.online' ||
				url.hostname.endsWith( '.passport.online' ) )
		);
	} catch ( e ) {
		return false;
	}
};

export default isPassportRedirect;
