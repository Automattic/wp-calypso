const isUserAccountEmailUpdateRedirect = ( redirectUrl: string | null ): boolean => {
	if ( ! redirectUrl ) {
		return false;
	}

	try {
		return new URLSearchParams( redirectUrl.split( '?' )[ 1 ] ).has( 'newuseremail' );
	} catch ( e ) {
		return false;
	}
};

export default isUserAccountEmailUpdateRedirect;
