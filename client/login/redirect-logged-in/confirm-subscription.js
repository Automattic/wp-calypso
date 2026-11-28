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

export function isDifferentEmail( currentUserEmail, linkEmail ) {
	const normalize = ( email ) => ( typeof email === 'string' ? email.trim().toLowerCase() : '' );
	const normalizedCurrent = normalize( currentUserEmail );
	const normalizedLink = normalize( linkEmail );

	return Boolean( normalizedCurrent && normalizedLink && normalizedCurrent !== normalizedLink );
}
