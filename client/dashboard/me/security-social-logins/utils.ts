export const getRedirectUri = () => {
	const host = typeof window !== 'undefined' && window.location.host;

	let protocol = 'https';
	if ( typeof window !== 'undefined' && window.location.hostname === 'calypso.localhost' ) {
		protocol = 'http';
	}

	return `${ protocol }://${ host }/start/user`;
};
