export function isConfirmSubscriptionRedirect( url ) {
	if ( ! url || typeof url !== 'string' ) {
		return false;
	}

	try {
		const urlObject = new URL( url );
		return (
			urlObject.protocol === 'https:' &&
			urlObject.hostname === 'subscribe.wordpress.com' &&
			Boolean( urlObject.searchParams.get( 'activate' )?.trim() )
		);
	} catch {
		return false;
	}
}

export function getConfirmSubscriptionEmail( params, redirectTo ) {
	if ( typeof params?.email === 'string' && params.email.trim() ) {
		return params.email;
	}

	if ( ! redirectTo || typeof redirectTo !== 'string' ) {
		return '';
	}

	try {
		return new URL( redirectTo ).searchParams.get( 'email' ) || '';
	} catch {
		return '';
	}
}

export function isDifferentEmail( currentUserEmail, linkEmail ) {
	const normalize = ( email ) => ( typeof email === 'string' ? email.trim().toLowerCase() : '' );
	const normalizedCurrent = normalize( currentUserEmail );
	const normalizedLink = normalize( linkEmail );

	return Boolean( normalizedCurrent && normalizedLink && normalizedCurrent !== normalizedLink );
}
