const parseUrl = ( url: string ) => {
	try {
		return new URL( url );
	} catch ( error ) {
		return null;
	}
};

export const canUseAutomaticGoBack = () => {
	const referrer = parseUrl( document.referrer );
	if ( ! referrer ) {
		return false;
	}

	return referrer.host === window.location.host;
};
